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
function MatchOption({ match }) {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isAuthenticated, getSupabaseClient } = useAuth();

    async function FetchUserProfile(userId, isAuthenticated, getSupabaseClient) {
        if (!userId) {
            throw new Error("No userId provided");
        }

        let userDetails = null;
        let error = null;

        try {
            await dbGetRequest(
                `/users?id=${userId}`, // Endpoint
                (data) => { userDetails = data; }, // Success callback
                (err) => { error = err; }, // Error callback
                isAuthenticated,
                getSupabaseClient
            );         
            for (let i of userDetails) {
                if (i["id"] === userId) {
                    console.log("found the user: ", i);
                    return i;
                }
            }

            if (error) {
                throw new Error(error);
            }

            return null;
            
        } catch (err) {
            console.error("Error fetching user profile:", err);
            throw err;
        }
    }

    useEffect(() => {
        async function getUserProfile() {
            if (!isAuthenticated) {
                setError("User is not authenticated");
                setLoading(false);
                return;
            }

            try {
                const profile = await FetchUserProfile(
                    match.user2_id,
                    isAuthenticated,
                    getSupabaseClient
                );
                setUserProfile(profile);
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setError("Failed to load user profile");
            } finally {
                setLoading(false);
            }
        }

        getUserProfile();
    }, [match.user2_id, isAuthenticated, getSupabaseClient]);

    function scheduleDate() {
        alert("Not implemented yet!");
    }

    return (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 max-w-lg mx-auto h-full flex flex-col">
            <div className="mb-auto">
                
                {loading ? (
                    <p className="text-gray-500 text-center">Loading profile...</p>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : (
                    <div className="flex flex-col items-center">
                        {/* Profile Picture */}
                        <div className="h-[300px] w-[300px] rounded-md mb-6">
                            <img
                                src={userProfile["profile_picture"] || defaultpfp}
                                alt={`${userProfile?.name || 'User'}'s profile`}
                                className="h-full w-full object-cover rounded-md"
                            />
                        </div>

                        {/* Name */}
                        <h2 className="mt-4 text-lg font-semibold text-gray-700 text-center">
                            {userProfile["name"] || 'Unknown User'}
                        </h2>

                        {/* Bio */}
                        <h2 className="mt-4 text-lg text-gray-700 text-center">
                            {userProfile["bio"] || 'Unknown Bio'}
                        </h2>
                    </div>
                )}
            </div>
            <button
                onClick={scheduleDate}
                className="mt-6 bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-100 px-6 py-3 rounded w-full"
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
                        console.log("got user", user.name);
                        userName = user.name;
                    }
                };
        
                const handleError = (error) => {
                    console.error("Failed to fetch user's info", error);
                };
        
                await dbGetRequest(`/users/${match.user2_id}`, setUser, handleError, isAuthenticated, getSupabaseClient);
                
                console.log(userName.includes(searchQuery));
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
