import React from 'react';
import { useAuth } from '../AuthContext';
import Navbar from './navbar';
import { useState } from 'react';
import DropdownComponent from './DateSearchDropdown';

function DateOption({ name, date, time }) {
    return (
        <div class="bg-gray-100 border border-gray-300 rounded-lg p-4">
            <div class="aspect-square bg-gray-300 rounded-md"></div>
            <h2 class="mt-4 text-lg font-semibold text-gray-700 text-center">{name}</h2>
            <p class="text-sm text-gray-500 text-center">{date} {time}</p>
            <button class="mt-4 bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded w-full">
                Contact {name}
            </button>
        </div>
    );
}

function FindDatePage({ dates }) {
    const [filteredDates, setFilteredDates] = useState(dates);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    const handleApplyClick = () => {
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
                                <DateOption name={user.name} time={user.time} date={user.date} />
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

function PendingDatePage()
{
    return (
        <div>
            pending dates:
        </div>
    )
}

export default function HomePage()
{    
    const [ view, setView ] = useState("pending");
    
    const user1 = {name:"tiffany chen", date:"11/01/24", time:"10:00"}
    const dates = [user1, user1, user1,user1,user1,user1,user1,user1,user1,user1,user1,user1,user1]
    return (
        <div>
            <Navbar />
            <div class="p-6 space-y-6">
                <div class="flex justify-between items-center">
                    <div class="flex space-x-4">
                        <label class="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="view"
                                className="form-radio text-blue-600"
                                checked={view === "pending"}
                                onChange={() => setView("pending")}
                            />
                            <span>Pending Dates</span>
                            <span class="text-sm text-gray-500">({ dates.length })</span>
                        </label>
                        <label class="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="view"
                            className="form-radio text-blue-600"
                            checked={view === "find"}
                            onChange={() => setView("find")}
                        />
                            <span>Find a Date</span>
                        </label>
                    </div>
                </div>

                {
                    view == "pending" ?
                    <PendingDatePage/>
                    :
                    <FindDatePage dates={ dates } />
                }
            </div>
        </div>
    );
}