import React from 'react';
import { useAuth } from '../AuthContext';
import Navbar from './navbar';

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

export default function HomePage()
{
    const user1 = {name:"tiffany chen", date:"11/01/24", time:"10:00"}
    const user2 = {name:"tiffany chen", date:"11/01/24", time:"10:00"}
    const user3 = {name:"tiffany chen", date:"11/01/24", time:"10:00"}
    const user4 = {name:"tiffany chen", date:"11/01/24", time:"10:00"}
    const user5 = {name:"tiffany chen", date:"11/01/24", time:"10:00"}
    const dates = [user1, user2, user3, user4, user5, user1, user2, user3, user4, user5,user1, user2, user3, user4, user5]
    return (
        <div>
            <Navbar />
            <div class="p-6 space-y-6">
                <div class="flex justify-between items-center">
                    <div class="flex space-x-4">
                        <label class="flex items-center space-x-2">
                            <input type="radio" name="view" class="form-radio text-blue-600" checked />
                            <span>Pending Dates</span>
                            <span class="text-sm text-gray-500">({ dates.length })</span>
                        </label>
                        <label class="flex items-center space-x-2">
                            <input type="radio" name="view" class="form-radio text-blue-600" />
                            <span>Find a Date</span>
                        </label>
                    </div>
                </div>

                <div class="flex space-x-4">
                    <button class="bg-blue-600 text-white px-4 py-2 rounded">Apply</button>
                    <button class="flex items-center border border-gray-300 px-4 py-2 rounded text-gray-700">
                        <svg class="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M9 6v12M15 6v12" />
                        </svg>
                        Filters
                    </button>
                </div>

                <div class="w-full overflow-x-auto">
                    <div class="flex space-x-2">
                        {dates.map((user, index) => (
                            <div class="flex-shrink-0">
                                <DateOption key={index} name={user.name} time={user.time} date={user.date} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}