import React from 'react';
import Navbar from './navbar';
import { useState, useEffect } from 'react';
import DropdownComponent from './DateSearchDropdown';
import { useAuth } from '../AuthContext';
import { dbGetRequest } from '../api/db';

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
    function scheduleDate() {
        alert("not implemented yet!")
    }
    useEffect(() => console.log(match), [])

    return (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 max-w-lg mx-auto h-full flex flex-col">
            <div className="mb-auto">
                <div className="aspect-square bg-gray-300 rounded-md mb-6 mx-auto" style={{ height: '300px', width: '300px' }}></div>
                <h2 className="mt-4 text-lg font-semibold text-gray-700 text-center">User2 ID: {match.user2_id}</h2>
                <p className="text-sm text-gray-500 text-center">Later we'll display user name and photo instead</p>
            </div>
            <button onClick={scheduleDate} className="mt-6 bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-100 px-6 py-3 rounded w-full ">
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
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    // force rerender when supplied matches change
    useEffect(() => {
        if (!matches) return;
        setFilteredMatches(matches);
        handleApplyClick();
    }, [matches]);

    // apply the current `selectedFilters` to filter out matches
    const handleApplyClick = () => {
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

        setFilteredMatches(filtered);
    };

    const handleFilterToggle = (filter) => {
        setSelectedFilters((prevFilters) => {
            if (prevFilters.includes(filter)) {
                return prevFilters.filter((f) => f !== filter);
            } else {
                return [...prevFilters, filter];
            }
        });
    };

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

/**
 * Pending Dates Page
 * 
 * Displays Pending and Confirmed dates for the current user.
 * 
 * @param {Array<Object>} dates - Array of date objects, each dates represents a scheduled, pending, or rejected date
 *
 * @param {Object} date - An specific date object
 * @param {number} date.id - Unique id for the date.
 * @param {string} date.user1_id - ID of the current user.
 * @param {string} date.user2_id - ID of the other user involved.
 * @param {string} date.date_start - Start time of the date in ISO 8601 format ("YYYY-MM-DDTHH:MM:SS").
 * @param {string} date.date_end - End time of the date in ISO 8601 format ("YYYY-MM-DDTHH:MM:SS").
 * @param {string} date.status - Current status of the date. 3 valid values:
 *   - `"pending"`: The date has been requested by one user.
 *   - `"confirmed"`: The date has been confirmed by both users.
 *   - `"rejected"`: The date was rejected by one of the users.
 */
function PendingDatePage({ dates }) {
    const confirmedDates = dates.filter((date) => date.status === "confirmed");
    const pendingDates = dates.filter((date) => date.status === "pending");
    console.log(dates)

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold text-center text-blue-600">Confirmed Dates</h1>
            {confirmedDates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {confirmedDates.map((date) => (
                        <div
                            key={date.id}
                            className="border rounded-lg p-4 shadow-lg bg-white"
                        >
                            <div className="text-lg font-semibold text-gray-800">
                                Other user ID (TEMP): {date.user2_id}
                            </div>
                            <div className="text-gray-600">
                                Start: {new Date(date.date_start).toLocaleString()}
                            </div>
                            <div className="text-gray-600">
                                End: {new Date(date.date_end).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    No confirmed dates found.
                </div>
            )}
            <h1 className="text-2xl font-bold text-center text-blue-600">Pending Dates</h1>
            {pendingDates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingDates.map((date) => (
                        <div
                            key={date.id}
                            className="border rounded-lg p-4 shadow-lg bg-white"
                        >
                            <div className="text-lg font-semibold text-gray-800">
                                Other user ID (TEMP): {date.user2_id}
                            </div>
                            <div className="text-gray-600">
                                Start: {new Date(date.date_start).toLocaleString()}
                            </div>
                            <div className="text-gray-600">
                                End: {new Date(date.date_end).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    No pending dates found.
                </div>
            )}
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


/**
 * Dates Homepage
 * 
 * Displays two tabs, Find a Date and Pending Dates. 
 * Loads potential matches for the current user, along with pending and confirmed dates.
 */
export default function HomePage() {
    const [ view, setView ] = useState('find');
    const [ matches, setMatches ] = useState([]); // potential matches for the user
    const [ dates, setDates ] = useState([]);  // pending and confirmed dates
    const { isAuthenticated, getSupabaseClient } = useAuth();
    
    // Load dates and matches data on page load
    useEffect(() => {
        // extracts dates data
        function setDatesData(data) {
            setDates(data);
        }
        // extracts matches data
        function setMatchesData(data) {
            setMatches(data);
        }
        // BETTER ERROR RESPONSE LATER
        function setError(error) {
            console.error("Error occurred while fetching data", error);
        }

        dbGetRequest('/dates', setDatesData, setError, isAuthenticated, getSupabaseClient);
        dbGetRequest('/matches', setMatchesData, setError, isAuthenticated, getSupabaseClient);
    }, [ isAuthenticated, getSupabaseClient ]);

    return (
        <div>
            <Navbar />
            <div className="p-6 space-y-6">
                <div className="flex justify-center">
                    <div className="flex border-b">
                        <button
                            className={`px-4 py-2 text-lg font-semibold ${
                                view === 'find'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-blue-600'
                            }`}
                            onClick={() => setView('find')}
                        >
                            Find a Date
                        </button>
                        <button
                            className={`px-4 py-2 text-lg font-semibold ${
                                view === 'pending'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-blue-600'
                            }`}
                            onClick={() => setView('pending')}
                        >
                            Pending Dates{' '}
                            <span className="text-sm text-gray-500">({dates.length})</span>
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    {view === 'find' ? (
                        <FindDatePage matches={matches} />
                    ) : (
                        <PendingDatePage dates={dates} />
                    )}
                </div>
            </div>
        </div>
    );
}