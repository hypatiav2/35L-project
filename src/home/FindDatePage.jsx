import { useState, useEffect } from 'react';
import DropdownComponent from './DateSearchDropdown';
import { dbGetRequest } from '../api/db';
import { useAuth } from '../AuthContext';
import defaultpfp from './defaultpfp.png'

/**
 * Match component
 * 
 * Displays a match with another user. Shows the name of the user, with a button to schedule a date with that user.
 * 
 * @param {Object} match - match object represents a pair between two users, with their overlapping availabilities.
 *   @param {string} match.user1_id - ID of current user.
 *   @param {string} match.user2_id - ID of the second user in the match.
 *   @param {number} match.similarity_score - the similarity between the users.
 *   @param {Array<Object>} match.availabilities - Array of availability objects
 * 
 * @param {Object} availability - An individual availability object within a match
 *   @param {number} availability.id - Always zero
 *   @param {string} availability.user_id - ID of second user associated with this availability.
 *   @param {string} availability.day_of_week - Day of the week (full, capitalized).
 *   @param {string} availability.start_time - Starting time of the availability in HH:MM:SS format.
 *   @param {string} availability.end_time - Ending time of the availability in HH:MM:SS format.
 */

function RingComponent({ N, size = 60 }) {
    N = Math.round(N * 100);   
    const percentage = Math.max(0, Math.min(100, N)); // Ensure percentage is between 0 and 100
    const strokeWidth = size * 0.1; // Adjust stroke width relative to size
    const radius = (size - strokeWidth) / 2; // Radius of the circle
    const circumference = 2 * Math.PI * radius; // Circumference of the circle
    const offset = circumference - (percentage / 100) * circumference; // Offset for the filled portion

    // Color based on percentage (from green to yellow)
    const color = `hsl(${60 + ( N / 100) * 60}, 60%, 50%)`;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="mx-auto"
        >
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="lightgray"
                strokeWidth={strokeWidth}
                fill="none"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="none"
            />
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy="0.3em"
                fontSize={`${size * 0.25}px`}
                fill="black"
            >
                {N}%
            </text>
        </svg>
    );
}

function MatchOption({ match }) {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const { isLoading, isAuthenticated, getSupabaseClient } = useAuth();

    useEffect(() => {
        if (isLoading) return; // don't load while loading
        if (!isAuthenticated) {
            setError("User is not authenticated");
            return;
        }
        if(!match.user2_id) {
            setError("User ID is missing");
            return;
        }

        const getUserProfile = async () => {
            await dbGetRequest(
                `/users/${match.user2_id}`, 
                setUser, 
                () => setError("Failed to load user profile"),
                isAuthenticated, getSupabaseClient);
        }
        getUserProfile();
    }, [match, isLoading, isAuthenticated, getSupabaseClient]);

    function scheduleDate() {
        alert("Not implemented yet!");
    }

    return (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-6 flex flex-col items-center justify-between w-[250px] h-[450px]">
            <div className="flex flex-col items-center space-y-4 mb-auto">
                {isLoading ? (
                    <p className="text-gray-500 text-center">Loading profile...</p>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : (
                    <>
                        {/* Profile Picture */}
                        <div className="h-40 w-40 rounded-md overflow-hidden">
                            <img
                                src={user?.profile_picture || defaultpfp}
                                alt={`${user?.name || 'User'}'s profile`}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Name */}
                        <h2 className="text-lg font-semibold text-gray-700 text-center">
                            {user?.name || 'Unknown User'}
                        </h2>

                        {/* Bio */}
                        <p className="text-sm text-gray-600 text-center break-words max-h-[80px] overflow-hidden">
                            {user?.bio || 'No bio available.'}
                        </p>

                        {/* Compatibility Ring */}
                        <div className="w-16 h-16">
                            <RingComponent N={match.similarity_score} />
                        </div>
                    </>
                )}
            </div>
            <button
                onClick={scheduleDate}
                className="bg-blue-600 text-white hover:bg-blue-700 transition px-6 py-3 rounded w-full"
            >
                Schedule
            </button>
        </div>
    );
}




/**
 * Find a Date page
 * 
 * Shows a list of matches for the current user. Filters can be applied to the matches, based on timing and day of the week.
 *
 * 
 * @param {Array<Object>} matches - Array of match objects.
 * 
 * @param {Object} match - match object represents a pair between two users, with their overlapping availabilities.
 *   @param {string} match.user1_id - ID of current user.
 *   @param {string} match.user2_id - ID of the second user in the match.
 *   @param {number} match.similarity_score - the similarity between the users.
 *   @param {Array<Object>} match.availabilities - Array of availability objects
 * 
 * @param {Object} availability - An individual availability object within a match
 *   @param {number} availability.id - Always zero
 *   @param {string} availability.user_id - ID of second user associated with this availability.
 *   @param {string} availability.day_of_week - Day of the week (full, capitalized).
 *   @param {string} availability.start_time - Starting time of the availability in HH:MM:SS format.
 *   @param {string} availability.end_time - Ending time of the availability in HH:MM:SS format.
 */

function FindDatePage({ matches }) {
    const { isAuthenticated, getSupabaseClient } = useAuth();
    const [searchQuery, setSearchQuery] = useState(""); // user search
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    // force rerender when supplied matches change, or when searchQuery changes
    useEffect(() => {
        if (!matches) return;
        setFilteredMatches(matches);
        handleApplyClick();
    }, [matches, searchQuery]);

    // apply the current `selectedFilters` to filter out matches, and filter by search as well
    const handleApplyClick = async () => {
        if (!matches) return;

        let filtered = matches;

        // check if each match contains at least one availability that matches any filter
        if (selectedFilters.length > 0) {
            filtered = matches.filter((match) => {
                return selectedFilters.some((filter) => {
                    // filter specific days of the week
                    if (["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].includes(filter.toLowerCase())) {
                        return match.availabilities.some((availability) => {
                            return availability.day_of_week.toLowerCase() === filter.toLowerCase();
                        });
                    }
                    //  filter times of day
                    if (["lunch", "dinner"].includes(filter.toLowerCase())) {
                        return match.availabilities.some((availability) => {
                            return isDuringTimeOfDay(availability.start_time, filter.toLowerCase());
                        });
                    }
                    return false;
                });
            });
        }

        // if there is a search string, filter by search
        if(searchQuery !== "") {
            const searchedMatches = await Promise.all(filtered.map(async (match) => {
                let userName = "";
                const setUser = (user) => {
                    if (user) {
                        userName = user.name;
                    }
                };
        
                const handleError = (error) => {
                    console.error("Failed to fetch user's info", error);
                };
        
                await dbGetRequest(`/users/${match.user2_id}`, setUser, handleError, isAuthenticated, getSupabaseClient);
                
                if (userName.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return match; // keep
                } else {
                    return null; // exclude if doesnt match
                }
            }));
            setFilteredMatches(searchedMatches.filter(match => match !== null));
        } else {
            setFilteredMatches(filtered);
        }
    };

    // toggle a filter on or off
    const handleFilterToggle = (filter) => {
        setSelectedFilters((prevFilters) => {
            if (prevFilters.includes(filter)) {
                return prevFilters.filter((f) => f !== filter);
            } else {
                return [...prevFilters, filter];
            }
        });
    };

    // open dropdown menu
    const handleFilterButtonClick = () => {
        setDropdownVisible(!isDropdownVisible);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex space-x-4">
                <button onClick={handleApplyClick} className="bg-blue-600 text-white px-4 py-2 rounded">
                    Apply
                </button>
                <button onClick={handleFilterButtonClick} className="flex items-center border border-gray-300 px-4 py-2 rounded text-gray-700">
                    <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6h18M9 6v12M15 6v12" />
                    </svg>
                    Filters
                </button>
                <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    type="text"
                    placeholder="Search for somebody..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                    className="px-4 py-2 text-white bg-gray-500 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1" 
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear Search"
                >✕</button>  
            </div>

            {isDropdownVisible && (
                <DropdownComponent selectedFilters={selectedFilters} onFilterToggle={handleFilterToggle} />
            )}

            <div className="w-full overflow-x-auto">
                <div className="flex space-x-2">
                    {filteredMatches.length > 0 ? (
                        filteredMatches.map((match, index) => (
                            <div key={index} className="flex-shrink-0">
                                <MatchOption match={match} />
                            </div>
                        ))
                    ) : (
                        <p>No dates found based on the selected filters.</p>
                    )}
                </div>
            </div>
        </div>
    );
}


// HELPER Func to check if a time is during lunch or dinner. Time must be formatted HH:MM:SS
function isDuringTimeOfDay(time, filter) {
    // Check if the time is HH:MM:SS
    const timeRegex = /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    if (!timeRegex.test(time)) {
        console.error(`Unexpected time format encountered: ${time}. Expected format is HH:MM:SS.`);
        return false; // Return false if the time format is invalid
    }

    const matchTime = new Date(`1970-01-01T${time}`); // Convert availability time to Date object

    if (filter === "lunch") {
        // Let's say lunch is between 11:00 and 15:00 
        const lunchStart = new Date('1970-01-01T11:00:00');
        const lunchEnd = new Date('1970-01-01T15:00:00');
        return matchTime >= lunchStart && matchTime <= lunchEnd;
    } else if (filter === "dinner") {
        // Let's say dinner is between 17:00 and 21:00
        const dinnerStart = new Date('1970-01-01T17:00:00');
        const dinnerEnd = new Date('1970-01-01T21:00:00');
        return matchTime >= dinnerStart && matchTime <= dinnerEnd;
    }

    return false; // Return false for other cases
}



export default FindDatePage;