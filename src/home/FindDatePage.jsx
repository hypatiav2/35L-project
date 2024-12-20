import { useState, useEffect, useRef } from 'react';
import DropdownComponent from './DateSearchDropdown';
import { dbGetRequest } from '../api/db';
import { useAuth } from '../AuthContext';
import MatchOption from './MatchOption';

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

function FindDatePage({ matches, reloadDates }) {
    const { isAuthenticated, getSupabaseClient } = useAuth();
    const [searchQuery, setSearchQuery] = useState(""); // user search
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // force rerender when supplied matches change, or when searchQuery changes
    useEffect(() => {
        if (!matches) return;
        setFilteredMatches(matches);
        handleApplyClick();
    }, [matches, searchQuery]);

    useEffect(() => {
        // Close dropdown if clicking outside of it
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setDropdownVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // apply the current `selectedFilters` to filter out matches, and filter by search as well
    const handleApplyClick = async () => {
        if (!matches) return;

        let filtered = matches;

        // check if each match contains at least one availability that matches any filter
        if (selectedFilters.length > 0) {
            let count = 0
            // filter by lunch
            if(selectedFilters.includes("lunch")) {
                count++;
                filtered = matches.filter((match) => {
                    return match.availabilities.some((availability) => {
                        return isDuringTimeOfDay(availability.start_time, "lunch");
            })})}
            // filter by dinner
            if(selectedFilters.includes("dinner")) {
                count++;
                filtered = matches.filter((match) => {
                    return match.availabilities.some((availability) => {
                        return isDuringTimeOfDay(availability.start_time, "dinner");
            })})}
            //filter by day of week
            if(selectedFilters?.length > count) {
                filtered = matches.filter((match) => {
                    return selectedFilters.some((filter) => {
                        // filter specific days of the week
                        if (["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].includes(filter.toLowerCase())) {
                            return match.availabilities.some((availability) => {
                                return availability.day_of_week.toLowerCase() === filter.toLowerCase();
                            });
                        }
                        return false;
            })})}
        };

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
                <button ref={buttonRef} onClick={handleFilterButtonClick} className="flex items-center border border-gray-300 px-4 py-2 rounded text-gray-700">
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
                <div ref={dropdownRef}><DropdownComponent selectedFilters={selectedFilters} onFilterToggle={handleFilterToggle} /></div>
            )}

            <div className="w-full overflow-x-auto">
                <div className="flex space-x-2">
                    {filteredMatches.length > 0 ? (
                        filteredMatches.map((match, index) => (
                            <div key={index} className="flex-shrink-0">
                                <MatchOption match={match} onSchedule={reloadDates} />
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
