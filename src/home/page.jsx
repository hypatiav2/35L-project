import React from 'react';
import Navbar from './navbar';
import { useState, useEffect } from 'react';
import DropdownComponent from './DateSearchDropdown';

function DateOption({ name, startTime, endTime, matchID, scheduleDate }) {
    function formatDateAbbreviated(isoDateString) {
        const date = new Date(isoDateString);
    
        const options = {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        };
    
        const formatter = new Intl.DateTimeFormat('en-US', options);
        return formatter.format(date);
    }

    return (
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-8 max-w-lg mx-auto">
            <div className="aspect-square bg-gray-300 rounded-md mb-6" style={{ height: '300px', width: '300px' }}></div>
            <h2 className="mt-4 text-lg font-semibold text-gray-700 text-center">{name}</h2>
            <p className="text-sm text-gray-500 text-center">{formatDateAbbreviated(startTime)}</p>
            <button onClick={() => scheduleDate(matchID)} className="mt-6 bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-100 px-6 py-3 rounded w-full">
                Schedule
            </button>
        </div>
    );
}

function FindDatePage({ dates }) {
    const [filteredDates, setFilteredDates] = useState(dates);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const handleApplyClick = () => {
        if (!dates) return;
        let filtered = dates;

        if (selectedFilters.length > 0) {
            filtered = dates.filter((user) => {
                return selectedFilters.some((filter) => {
                    if (filter === 'lunch') {
                        const time = new Date(`1970-01-01T${user.time}:00`);
                        return time >= new Date('1970-01-01T11:00:00') && time <= new Date('1970-01-01T15:00:00');
                    }
                    if (filter === 'dinner') {
                        const time = new Date(`1970-01-01T${user.time}:00`);
                        return time >= new Date('1970-01-01T17:00:00') && time <= new Date('1970-01-01T23:00:00');
                    }
                    const dayOfWeek = filter;
                    const date = new Date(user.date);
                    const day = date.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
                    return day === dayOfWeek;
                });
            });
        }

        setFilteredDates(filtered);
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
                    {filteredDates.length > 0 ? (
                        filteredDates.map((user, index) => (
                            <div key={index} className="flex-shrink-0">
                                <DateOption matchID={user.match_id} name={user.name} startTime={user.date_start} endTime={ user.date_end } />
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

function PendingDatePage({ dates }) {
    const confirmedDates = dates.filter((date) => date.is_confirmed);

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
                                Match ID: {date.match_id}
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
        </div>
    );
}


export default function HomePage() {
    const [view, setView] = useState('find');
    const [dates, setDates] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/v1/dates')
            .then((response) => response.json())
            .then((data) => setDates(data))
            .catch((err) => {
                console.error('Error fetching profiles:', err);
                const testDates = [
                    {
                        id: 1,
                        match_id: 101,
                        date_start: "2024-12-01T09:00:00Z",
                        date_end: "2024-12-01T10:00:00Z",
                        is_confirmed: true,
                    },
                    {
                        id: 2,
                        match_id: 102,
                        date_start: "2024-12-02T11:00:00Z",
                        date_end: "2024-12-02T12:00:00Z",
                        is_confirmed: false,
                    },
                    {
                        id: 3,
                        match_id: 103,
                        date_start: "2024-12-03T13:00:00Z",
                        date_end: "2024-12-03T14:00:00Z",
                        is_confirmed: true,
                    },
                    {
                        id: 4,
                        match_id: 104,
                        date_start: "2024-12-04T15:30:00Z",
                        date_end: "2024-12-04T16:30:00Z",
                        is_confirmed: false,
                    },
                    {
                        id: 5,
                        match_id: 105,
                        date_start: "2024-12-05T17:00:00Z",
                        date_end: "2024-12-05T18:00:00Z",
                        is_confirmed: true,
                    },
                    {
                        id: 6,
                        match_id: 106,
                        date_start: "2024-12-06T09:30:00Z",
                        date_end: "2024-12-06T10:30:00Z",
                        is_confirmed: false,
                    },
                    {
                        id: 7,
                        match_id: 107,
                        date_start: "2024-12-07T11:00:00Z",
                        date_end: "2024-12-07T12:00:00Z",
                        is_confirmed: true,
                    },
                    {
                        id: 8,
                        match_id: 108,
                        date_start: "2024-12-08T13:30:00Z",
                        date_end: "2024-12-08T14:30:00Z",
                        is_confirmed: false,
                    },
                    {
                        id: 9,
                        match_id: 109,
                        date_start: "2024-12-09T15:00:00Z",
                        date_end: "2024-12-09T16:00:00Z",
                        is_confirmed: true,
                    },
                    {
                        id: 10,
                        match_id: 110,
                        date_start: "2024-12-10T17:30:00Z",
                        date_end: "2024-12-10T18:30:00Z",
                        is_confirmed: false,
                    },
                    {
                        id: 11,
                        match_id: 111,
                        date_start: "2024-12-11T09:00:00Z",
                        date_end: "2024-12-11T10:00:00Z",
                        is_confirmed: true,
                    },
                    {
                        id: 12,
                        match_id: 112,
                        date_start: "2024-12-12T11:30:00Z",
                        date_end: "2024-12-12T12:30:00Z",
                        is_confirmed: false,
                    },
                    {
                        id: 13,
                        match_id: 113,
                        date_start: "2024-12-13T13:00:00Z",
                        date_end: "2024-12-13T14:00:00Z",
                        is_confirmed: true,
                    },
                    {
                        id: 14,
                        match_id: 114,
                        date_start: "2024-12-14T15:30:00Z",
                        date_end: "2024-12-14T16:30:00Z",
                        is_confirmed: false,
                    },
                    {
                        id: 15,
                        match_id: 115,
                        date_start: "2024-12-15T17:00:00Z",
                        date_end: "2024-12-15T18:00:00Z",
                        is_confirmed: true,
                    },
                ];
                setDates(testDates);
            });
    }, []);

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
                        <FindDatePage dates={dates} />
                    ) : (
                        <PendingDatePage dates={dates} />
                    )}
                </div>
            </div>
        </div>
    );
}