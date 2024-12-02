import React, { useState, useEffect } from 'react';
import Navbar from '../home/navbar';

export default function SchedulePage() {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [selectedSlots, setSelectedSlots] = useState({});
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ message, setMessage ] = useState('');
    
    const generateTimeSlots = () => {
        const slots = [];
        const startHour = 9;
        const endHour = 23;

        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
                const minuteFormatted = minute === 0 ? '00' : minute;
                const amPm = hour < 12 ? 'AM' : 'PM';
                slots.push(`${hourFormatted}:${minuteFormatted} ${amPm}`);
            }
        }
        return slots;
    };

    const timeLabels = generateTimeSlots();

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const response = await fetch('/api/v1/availability');
                if (!response.ok) throw new Error('Failed to fetch availability');
                const data = await response.json();
                const slots = {};
                data.forEach(({ day_of_week, start_time }) => {
                    const slotKey = `${day_of_week}-${convertTo12HourFormat(start_time)}`;
                    slots[slotKey] = true;
                });
                setSelectedSlots(slots);
            } catch (err) {
                setError('Unable to load availability');
            } finally {
                setLoading(false);
            }
        };

        fetchAvailability();
    }, []);

    const convertTo12HourFormat = (time24) => {
        const [hour, minute] = time24.split(':').map(Number);
        const amPm = hour < 12 ? 'AM' : 'PM';
        const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
        return `${hourFormatted}:${minute === 0 ? '00' : minute} ${amPm}`;
    };

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
        setSelectedSlots((prevState) => ({
            ...prevState,
            [slotKey]: !prevState[slotKey],
        }));
    };

    async function addAvailability (day, startTime, endTime) {
        try {
            const response = await fetch('/api/v1/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    day_of_week: day,
                    start_time: startTime,
                    end_time: endTime,
                }),
            });

            if (response.status === 409) {
                const conflict = await response.json();
                setMessage(`Conflict: ${conflict.message}`);
            } else if (!response.ok) {
                throw new Error('Failed to add availability');
            } else {
                setMessage('Availability added successfully');
            }
        } catch (err) {
            setMessage('Error adding availability');
        }
    };

    async function updateAvailability (id, day, startTime, endTime) {
        try {
            const response = await fetch('/api/v1/availability', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    day_of_week: day,
                    start_time: startTime,
                    end_time: endTime,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update availability');
            }

            setMessage('Availability updated successfully');
        } catch (err) {
            setMessage('Error updating availability');
        }
    };

    async function deleteAvailability (id) {
        try {
            const response = await fetch('/api/v1/availability', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete availability');
            }

            setMessage('Availability deleted successfully');
        } catch (err) {
            setMessage('Error deleting availability');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="p-6 space-y-6 flex flex-col">
                <h1 className="text-2xl font-bold text-center">Select Time Slots</h1>
                {message && <div className="text-center text-blue-600 font-semibold">{message}</div>}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-gray-600 text-lg font-semibold">Loading availability...</div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-red-500 text-lg font-semibold">{error}</div>
                    </div>
                ) : (
                    <div className="inline-flex justify-center select-none">
                        <div className="grid grid-cols-8 gap-0 mt-6">
                            <div className="flex flex-col items-center">
                                <div className="text-gray-600 font-semibold">Time</div>
                                {timeLabels.map((time, index) => (
                                    <div key={index} className="w-24 h-8 flex items-center justify-center text-sm text-gray-600 border-b">
                                        {time}
                                    </div>
                                ))}
                            </div>
                            {daysOfWeek.map((day) => (
                                <div key={day} className="flex flex-col items-center">
                                    <div className="text-gray-600 font-semibold">{day}</div>
                                    {timeLabels.map((time, index) => {
                                        const slotKey = `${day}-${time}`;
                                        const isSelected = selectedSlots[ slotKey ];
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