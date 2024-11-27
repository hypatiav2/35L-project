import React, { useState } from 'react';
import Navbar from '../home/navbar';

export default function SchedulePage() {
    const timeSlots = [];
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const generateTimeSlots = () => {
        const slots = [];
        const startHour = 9; // Start at 9:00 AM
        const endHour = 23; // End at 11:00 PM

        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) { // Adjust interval to 30 minutes
                const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
                const minuteFormatted = minute === 0 ? '00' : minute;
                const amPm = hour < 12 ? 'AM' : 'PM';
                const timeLabel = `${hourFormatted}:${minuteFormatted} ${amPm}`;
                slots.push(timeLabel);
            }
        }
        return slots;
    };

    const [selectedSlots, setSelectedSlots] = useState({});
    const [dragging, setDragging] = useState(false);
    const [startSlot, setStartSlot] = useState(null);

    const timeLabels = generateTimeSlots(); // Time labels for each 30-minute slot

    const handleMouseDown = (day, time) => {
        setDragging(true);
        setStartSlot({ day, time });
        toggleSlot(day, time);
    };

    const handleMouseEnter = (day, time) => {
        if (dragging) {
            toggleSlot(day, time);
        }
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    const toggleSlot = (day, time) => {
        const slotKey = `${day}-${time}`;
        setSelectedSlots((prevState) => ({
            ...prevState,
            [slotKey]: !prevState[slotKey], // Toggle slot on click or drag
        }));
    };

    const isNextTime = (time1, time2) => {
        const time1Parts = time1.split(':');
        const time2Parts = time2.split(':');
        const hour1 = parseInt(time1Parts[0], 10);
        const hour2 = parseInt(time2Parts[0], 10);
        const minute1 = parseInt(time1Parts[1], 10);
        const minute2 = parseInt(time2Parts[1], 10);

        return (
            (hour1 === hour2 && minute2 === minute1 + 30) || // Adjacent 30-minute slots
            (hour2 === hour1 + 1 && minute2 === 0) // Next hour's start
        );
    };

    const getSelectedSlots = () => {
        const selected = Object.keys(selectedSlots).filter((key) => selectedSlots[ key ]);
        let continuousSlots = [];
        let tempRange = [];

        selected.forEach((slot, index) => {
            const [day, time] = slot.split('-');
            const nextSlot = selected[index + 1];
            const [nextDay, nextTime] = nextSlot ? nextSlot.split('-') : [null, null];

            if (!tempRange.length || (nextDay === day && isNextTime(time, nextTime))) {
                tempRange.push(time);
            } else {
                continuousSlots.push(tempRange);
                tempRange = [nextTime];
            }
        });

        if (tempRange.length) continuousSlots.push(tempRange);
        return continuousSlots;
    };

    const formatRange = (range) => {
        const startTime = range[0];
        const endTime = range[range.length - 1];
        return `(${startTime}, ${endTime})`;
    };

    return (
        <div>
            <Navbar />
            <div className="p-6 space-y-6 flex flex-col">
                <h1 className="text-2xl font-bold text-center">Select Time Slots</h1>
                <div className='inline-flex justify-center'>
                    <div className="grid grid-cols-8 gap-0 mt-6">
                        <div className="flex flex-col items-center">
                            <div className="text-gray-600 font-semibold">Time</div>
                            {timeLabels.map((time, index) => (
                                <div key={index} className="w-24 h-8 flex items-center justify-center text-sm text-gray-600 border-b">
                                    {time}
                                </div>
                            ))}
                        </div>
                        {daysOfWeek.map((day, dayIndex) => (
                            <div key={day} className="flex flex-col items-center">
                                <div className="text-gray-600 font-semibold">{day}</div>
                                {timeLabels.map((time, timeIndex) => {
                                    const slotKey = `${day}-${time}`;
                                    const isSelected = selectedSlots[slotKey];
                                    return (
                                        <div
                                            key={timeIndex}
                                            className={`w-24 h-8 flex items-center justify-center border-b border ${
                                                isSelected ? 'bg-blue-600' : 'bg-white'
                                            }`}
                                            onMouseDown={() => handleMouseDown(day, time)}
                                            onMouseEnter={() => handleMouseEnter(day, time)}
                                            onMouseUp={handleMouseUp}
                                            style={{ cursor: 'pointer' }} // Ensure pointer cursor
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <h2 className="text-xl font-semibold">Selected Time Slots:</h2>
                    <div className="text-lg">
                        {getSelectedSlots().map((range, index) => (
                            <div key={index}>
                                {formatRange(range)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}