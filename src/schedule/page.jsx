import React, { useState, useEffect } from 'react';
import Navbar from '../home/navbar';
import { useAuth } from '../AuthContext';
import { dbGetRequest, dbPostRequest, dbDeleteRequest } from '../api/db';
import { splitSlotIntoIntervals, generateTimeSlots, convertTo12HourFormat, slotComparator, collapseSlots } from './scheduleslots';
import { Toast } from '../toast';
import { useNavigate } from 'react-router-dom';

function SchedulePage() {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(true);
    const [slotIds, setSlotIds] = useState([]);
    const [ toastMessage, setToastMessage ] = useState("");
    const [ isSubmitted, setIsSubmitted ] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const { isAuthenticated, getSupabaseClient } = useAuth();
    const navigate = useNavigate();

    const triggerToast = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

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
            
        }
        const handleError = (error) => {
            console.error("Unable to fetch availability", error)
        }
        dbGetRequest('/availability', setAvailability, handleError, isAuthenticated, getSupabaseClient);
        setLoading(false);
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

    const handleToggleSlots = () => {
        if(selectedSlots?.length !== 0) {
            console.log(selectedSlots)
            setSelectedSlots([]);
        } else {
            setSelectedSlots(generateAllTimes());
        }
    }

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
        setIsSubmitted(true);
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
        function handleError(error) {
            console.error("failed to retrieve availability", error)
            triggerToast('Failed to update availability')
        }
        
        for (let i = 0; i < slotIds.length; i++) {
            const id = slotIds[i];
            const idObj = { id: id };
            await dbDeleteRequest('/availability', idObj, handleResponse, handleError, isAuthenticated, getSupabaseClient);
        }
        
        for (let i = 0; i < formattedData.length; i++) {
            const slot = formattedData[i];
            await dbPostRequest('/availability', slot, handleResponse, handleError, isAuthenticated, getSupabaseClient);
        }

        // make sure the slot ids reset
        if(slotIds.length > 0)
        {
            dbGetRequest('/availability', (data) => setSlotIds(data.map((slot) => slot.id)), handleError, isAuthenticated, getSupabaseClient);
        }

        console.log("availability submitted successfully")
        triggerToast('Availability updated!')
    }

    return (
        <div>
            <Navbar />
            <div className="p-6 space-y-6 flex flex-col items-center">
                <h1 className="text-2xl font-bold text-center">Select Time Slots</h1>
                {isSubmitted ? 
                    <div className="flex space-x-4 w-[50%]">
                        <button 
                            className="flex-1 btn btn-sm shadow-sm px-8 h-[40px] rounded-lg bg-blue-700 border-none text-white hover:bg-blue-300" 
                            onClick={() => navigate('/home')}
                        >
                                Return Home
                        </button>
                        <button 
                            className="flex-2 btn btn-smshadow-sm px-8 h-[40px] rounded-lg bg-gray-200 border-none text-red-800 font-semibold hover:bg-gray-300" 
                            onClick={() => setIsSubmitted(false)}
                        >
                                Edit
                        </button>
                    </div>
                :
                    <div className="flex space-x-4 w-[50%]">
                        <button 
                            className="flex-1 btn btn-sm shadow-sm px-8 h-[40px] rounded-lg bg-blue-700 border-none text-white hover:bg-blue-300" 
                            onClick={submitAvailability}
                        >
                                Submit Availability
                        </button>
                        <button 
                            className="flex-2 btn btn-smshadow-sm px-8 h-[40px] rounded-lg bg-gray-200 border-none text-red-800 font-semibold hover:bg-gray-300" 
                            onClick={handleToggleSlots}
                        >
                                {selectedSlots?.length === 0 ? "Fill" : "Clear"}
                        </button>
                    </div>
                }
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
            {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
        </div>
    );
}

function generateAllTimes() {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const startTime = 9 * 60; // 9:00 
    const endTime = 22 * 60 + 30; // 22:30
    const interval = 30; // 30 min

    const times = [];

    days.forEach(day => {
        for (let minutes = startTime; minutes <= endTime; minutes += interval) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const timeString = `${day}-${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            times.push(timeString);
        }
    });

    return times;
}

export default SchedulePage;