import defaultpfp from './defaultpfp.png'
import { Toast } from '../toast';
import { dbGetRequest, dbPostRequest } from '../api/db';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

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

function RingComponent({ N, size = 60 }) {
    N = Math.round(N * 100);   
    const percentage = Math.max(0, Math.min(100, N)); // Ensure percentage is between 0 and 100
    const strokeWidth = size * 0.1; // Adjust stroke width relative to size
    const radius = (size - strokeWidth) / 2; // Radius of the circle
    const circumference = 2 * Math.PI * radius; // Circumference of the circle
    const offset = circumference - (percentage / 100) * circumference; // Offset for the filled portion

    // Interpolate color based on percentage
    const getColor = (percentage) => {
        if (percentage >= 50) {
            // Between 50% (yellow) and 100% (green)
            const ratio = (percentage - 50) / 50; // Normalize to [0, 1]
            return interpolateColor('#e9f030', '#0eb324', ratio);
        } else {
            // Between 0% (red) and 50% (yellow)
            const ratio = percentage / 50; // Normalize to [0, 1]
            return interpolateColor('#c73222', '#e9f030', ratio);
        }
    };

    const interpolateColor = (color1, color2, ratio) => {
        const hex = (color) =>
            color.replace('#', '').match(/.{2}/g).map((hex) => parseInt(hex, 16));
        const [r1, g1, b1] = hex(color1);
        const [r2, g2, b2] = hex(color2);
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        return `rgb(${r}, ${g}, ${b})`;
    };

    const color = getColor(percentage);

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="mx-auto"
        >
            {/* Background Circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="lightgray"
                strokeWidth={strokeWidth}
                fill="none"
            />
            {/* Progress Circle */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="none"
                style={{
                    transform: `rotate(-90deg)`,
                    transformOrigin: '50% 50%',
                }}
            />
            {/* Percentage Text */}
            <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dy="0.3em"
                fontSize={`${size * 0.25}px`}
                fill="black"
            >
                {N}%
            </text>
        </svg>
    );
}

function convertTo12Hour(time24) {
    const [hour24, minute] = time24.split(":").map(Number);
    const ampm = hour24 >= 12 ? "pm" : "am";
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

function MatchOption({ match, onSchedule }) {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const { isLoading, isAuthenticated, getSupabaseClient } = useAuth();
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [showSchedules, setShowSchedules] = useState(false);
    const [dateScheduled, setDateScheduled] = useState(false);
    const [scheduleButtons, setScheduleButtons] = useState([]);

    const triggerToast = (message) => {
        setToastMessage(message);
        setShowToast(true);

        // Automatically hide the toast after 3 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    useEffect(() => {
        setScheduleButtons(generateScheduleButtons(match.availabilities || []))
    }, [])

    function getNextDate(dayOfWeek, time) {
        const daysOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        const now = new Date();
        const today = now.getDay();
        const targetDay = daysOfWeek.indexOf(dayOfWeek);

        const daysUntilTarget = (targetDay - today + 7) % 7 || 7;
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() + daysUntilTarget);

        const [hours, minutes] = time.split(":").map(Number);
        targetDate.setHours(hours, minutes, 0, 0);

        return targetDate.toISOString();
    }

    function generateScheduleButtons(availabilities) {
        return availabilities.flatMap((availability) => {
            const buttons = [];
            const { day_of_week, start_time, end_time } = availability;

            let [startHour, startMinute] = start_time.split(":").map(Number);
            let [endHour, endMinute] = end_time.split(":").map(Number);

            let startMinutes = startHour * 60 + startMinute;
            const endMinutes = endHour * 60 + endMinute;

            while (startMinutes < endMinutes) {
                const hours = Math.floor(startMinutes / 60);
                const minutes = startMinutes % 60;
                const time = `${hours.toString().padStart(2, "0")}:${minutes
                    .toString()
                    .padStart(2, "0")}`;

                buttons.push({
                    time,
                    day_of_week,
                    startDate: getNextDate(day_of_week, time),
                    endDate: getNextDate(day_of_week, `${hours}:${minutes + 30}`),
                });

                startMinutes += 30;
            }

            return buttons;
        });
    }

    // Fetch user profile
    useEffect(() => {
        if (isLoading) return; // don't load while loading
        if (!isAuthenticated) {
            setError("User is not authenticated");
            return;
        }
        if(!match.user2_id) {
            setError("User ID is missing");
            return;
        }

        const getUserProfile = async () => {
            await dbGetRequest(
                `/users/${match.user2_id}`, 
                setUser, 
                () => setError("Failed to load user profile"),
                isAuthenticated, getSupabaseClient);
        }
        getUserProfile();
    }, [match, isLoading, isAuthenticated, getSupabaseClient]);

    // Schedule a date
    async function scheduleDate(startDate, endDate) {
        function handleResponse(data)
        {
            console.log(data)
        }
        const requestBody = { user2_id: match.user2_id, date_start: startDate, date_end: endDate }
        await dbPostRequest('/dates', requestBody, handleResponse, handleResponse, isAuthenticated, getSupabaseClient);
        setScheduleButtons((buttons) =>
            buttons.filter((btn) => btn.startDate !== startDate)
        );
        triggerToast('Date request sent!')
        onSchedule();
        setDateScheduled(true);
    }

    return (
        <div className="bg-white-100 border border-gray-300 rounded-lg p-6 flex flex-col items-center w-[250px] h-[550px]">
            <div className="flex flex-col items-center space-y-4 flex-grow">
                {isLoading ? (
                    <p className="text-gray-500 text-center">Loading profile...</p>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : (
                    <>
                        {/* Profile Picture */}
                        {!showSchedules && (
                            <div className="h-40 w-40 rounded-full overflow-hidden">
                                <img
                                    src={
                                        user?.profile_picture
                                            ? `data:image/png;base64,${user.profile_picture}`
                                            : defaultpfp
                                    }
                                    alt={`${user?.name || 'User'}'s profile`}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        {/* Name */}
                        <h2 className="text-lg font-semibold text-gray-700 text-center">
                            {user?.name || 'Unknown User'}
                        </h2>

                        {/* Bio */}
                        <p className="text-sm text-gray-600 text-center break-words h-[50px] overflow-hidden">
                            {user?.bio || 'No bio available.'}
                        </p>

                        {/* Compatibility Ring */}
                        <div className="w-16 h-16">
                            <RingComponent N={match.similarity_score} />
                        </div>
                    </>
                )}
            </div>
            <div className="w-full space-y-2 overflow-auto h-max-[100px] mb-3 mt-6">
                {showSchedules && 
                (scheduleButtons.map((button, index) => (
                    <button
                        key={index}
                        onClick={() => scheduleDate(button.startDate, button.endDate)}
                        className="bg-blue-400 text-white hover:bg-blue-700 transition px-4 py-2 rounded w-full text-sm"
                    >
                        {button.day_of_week} at {convertTo12Hour(button.time)}
                    </button>
                )))}
            </div>
            <button 
                onClick={() => setShowSchedules(!showSchedules)}
                className="bg-blue-600 text-white hover:bg-blue-700 transition px-4 py-2 rounded w-full text-sm mb-auto"
            >
                {showSchedules ? "Cancel" : "Schedule A Date"}
            </button>
            {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
        </div>
    );
}

export default MatchOption;