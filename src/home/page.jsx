import React from 'react';
import Navbar from './navbar';
import { useState, useEffect } from 'react';

import { useAuth } from '../AuthContext';
import { dbGetRequest } from '../api/db';
import FindDatePage from './FindDatePage';
import PendingDatePage from './PendingDatePage';


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
    const [ currentUser, setCurrentUser ] = useState([]);  // pending and confirmed dates
    const { isAuthenticated, getSupabaseClient } = useAuth();
    
    function setDatesData(data) {
        setDates(data);
    }
    // BETTER ERROR RESPONSE LATER
    function setError(error) {
        console.error("Error occurred while fetching data", error);
    }
    async function getDateData()
    {        
        await dbGetRequest('/dates', setDatesData, setError, isAuthenticated, getSupabaseClient);
    }
    // Load dates and matches data on page load
    useEffect(() => {
        // extracts matches data
        function setMatchesData(data) {
            setMatches(data);
        }
        function setUser(data) {
            setCurrentUser(data);
        }
        const fetchData = async () => {
            await getDateData();
            await dbGetRequest('/users/me', setUser, setError, isAuthenticated, getSupabaseClient);
            await dbGetRequest('/matches', setMatchesData, setError, isAuthenticated, getSupabaseClient);
        };
        fetchData();
    
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
                        <FindDatePage matches={matches} reloadDates={getDateData} />
                    ) : (
                        <PendingDatePage dates={dates} user={ currentUser } />
                    )}
                </div>
            </div>
        </div>
    );
}