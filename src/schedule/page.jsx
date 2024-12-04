import React, { useState, useEffect } from 'react';
import Navbar from '../home/navbar';
import { useAuth } from '../AuthContext';
import { dbGetRequest, dbPostRequest, dbDeleteRequest } from '../api/db';
import { splitSlotIntoIntervals, generateTimeSlots, convertTo12HourFormat, slotComparator, collapseSlots } from './scheduleslots';

export default function SchedulePage() {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(true);
    const [slotIds, setSlotIds] = useState([]);
    const { isAuthenticated, getSupabaseClient } = useAuth();

    const timeLabels = generateTimeSlots();
    
    useEffect(() => {
        function setAvailability(data)
        {
            if (data)
            {
                setSlotIds(data.map((slot) => slot.id));
                const intervals = data.flatMap(slot => splitSlotIntoIntervals(slot));
                setSelectedSlots(intervals.sort(slotComparator))
            }
            setLoading(false);
        }
        const handleError =  (error) => {
            console.error("Unable to fetch availability", error)
        }
        dbGetRequest('/availability', setAvailability, handleError, isAuthenticated, getSupabaseClient);
    }, [isAuthenticated, getSupabaseClient]);

    const handleMouseDown = (day, time) => {
        setDragging(true);
        toggleSlot(day, time);
    };

    const handleMouseEnter = (day, time) => {
        if (dragging) toggleSlot(day, time);
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    const toggleSlot = (day, time) => {
        const slotKey = `${day}-${time}`;
    
        setSelectedSlots((prevState) => {
            const index = prevState.indexOf(slotKey);
    
            if (index !== -1) {
                const updatedSlots = [...prevState];
                updatedSlots.splice(index, 1);
                return updatedSlots;
            } else {
                const updatedSlots = [...prevState, slotKey];
                return updatedSlots.sort(slotComparator);
            }
        });
    };

    async function submitAvailability()
    {
        const collapsedSlots = collapseSlots(selectedSlots);
        const formattedData = collapsedSlots.map(slot => {    
            return {
                start_time: slot.start,
                end_time: slot.end,
                day_of_week: slot.day,
            };
        });
        function handleResponse(data)
        {
            // console.log(data)
        }
        
        for (let i = 0; i < slotIds.length; i++) {
            const id = slotIds[i];
            const idObj = { id: id };
            await dbDeleteRequest('/api/v1/availability', idObj, handleResponse, isAuthenticated, getSupabaseClient);
        }
        
        for (let i = 0; i < formattedData.length; i++) {
            const slot = formattedData[i];
            await dbPostRequest('/api/v1/availability', slot, handleResponse, isAuthenticated, getSupabaseClient);
        }

        // make sure the slot ids reset
        dbGetRequest('/api/v1/availability', (data) => setSlotIds(data.map((slot) => slot.id)), isAuthenticated, getSupabaseClient);
    }

    return (
        <div>
            <Navbar />
            <div className="p-6 space-y-6 flex flex-col items-center">
                <h1 className="text-2xl font-bold text-center">Select Time Slots</h1>
                <button className="btn btn-sm shadow-sm px-8 w-[50%] h-[40px] rounded-lg bg-blue-700 border-none text-white hover:bg-blue-300" onClick={submitAvailability}>Submit Availability</button>
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-gray-600 text-lg font-semibold">Loading availability...</div>
                    </div>
                ) : (
                    <div className="inline-flex justify-center select-none">
                        <div className="grid grid-cols-8 gap-0 mt-6">
                            <div className="flex flex-col items-center">
                                <div className="text-gray-600 font-semibold">Time</div>
                                {timeLabels.map((time, index) => (
                                    <div key={index} className="w-24 h-8 flex items-center justify-center text-sm text-gray-600 border-b">
                                        {convertTo12HourFormat(time)}
                                    </div>
                                ))}
                            </div>
                            {daysOfWeek.map((day) => (
                                <div key={day} className="flex flex-col items-center">
                                    <div className="text-gray-600 font-semibold">{day}</div>
                                    {timeLabels.map((time, index) => {
                                        const slotKey = `${day}-${time}`;
                                        const isSelected = selectedSlots.includes(slotKey);
                                        let id;
                                        return (
                                            <div
                                                key={index}
                                                className={`w-24 h-8 flex items-center justify-center border-b ${
                                                    isSelected ? 'bg-blue-600' : 'bg-white'
                                                }`}
                                                onMouseDown={() => handleMouseDown(day, time)}
                                                onMouseEnter={() => handleMouseEnter(day, time)}
                                                onMouseUp={handleMouseUp}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}