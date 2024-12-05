const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function splitSlotIntoIntervals(slot) {
    const intervals = [];
    const [startHour, startMinute] = slot.start_time.split(':').map(Number);
    const [endHour, endMinute] = slot.end_time.split(':').map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
        const nextMinute = currentMinute + 30;
        const nextHour = currentHour + Math.floor(nextMinute / 60);

        const intervalEndHour = nextHour;
        const intervalEndMinute = nextMinute % 60;

        const start_time = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        intervals.push(`${slot.day_of_week}-${start_time}`);

        currentHour = intervalEndHour;
        currentMinute = intervalEndMinute;
    }

    return intervals;
}

export const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 22;

    for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const hourFormatted = String(hour).padStart(2, '0');
            const minuteFormatted = String(minute).padStart(2, '0');
            
            slots.push(`${hourFormatted}:${minuteFormatted}`);
        }
    }
    return slots;
};

export const convertTo12HourFormat = (time24) => {
    const [hour, minute] = time24.split(':').map(Number);
    const amPm = hour < 12 ? 'AM' : 'PM';
    const hourFormatted = hour % 12 === 0 ? 12 : hour % 12;
    return `${hourFormatted}:${minute === 0 ? '00' : minute} ${amPm}`;
};

export const slotComparator = (a, b) => {
    const [dayA, timeA] = a.split('-');
    const [dayB, timeB] = b.split('-');

    const dayIndexA = daysOfWeek.indexOf(dayA);
    const dayIndexB = daysOfWeek.indexOf(dayB);

    if (dayIndexA !== dayIndexB) {
        return dayIndexA - dayIndexB;
    }

    return timeA.localeCompare(timeB);
};

export const collapseSlots = (slots) => {
    const slotObjects = slots.map((slotKey) => {
        const [day, time] = slotKey.split('-');
        const [hour, minute] = time.split(':').map(Number);

        const endHour = hour + Math.floor((minute + 30) / 60);
        const endMinute = (minute + 30) % 60;

        return {
            day,
            start: time,
            end: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
        };
    });

    const groupedSlots = slotObjects.reduce((acc, slot) => {
        acc[slot.day] = acc[slot.day] || [];
        acc[slot.day].push(slot);
        return acc;
    }, {});

    const collapsedSlots = Object.entries(groupedSlots).flatMap(([day, slots]) => {
        slots.sort((a, b) => a.start.localeCompare(b.start));

        const merged = [];
        let current = slots[0];

        for (let i = 1; i < slots.length; i++) {
            const next = slots[i];

            if (current.end === next.start) {
                current.end = next.end;
            } else {
                merged.push(current);
                current = next;
            }
        }

        merged.push(current);
        return merged;
    });

    return collapsedSlots;
};