import { useEffect, useState } from "react";
import { dbGetRequest, dbPatchRequest } from "../api/db";
import { useAuth } from "../AuthContext";
import { Toast } from "../toast";

function PendingDateCard({ date, onConfirm, type, currentUserID }) {
    const { date_start, date_end, status } = date;
    const [ user, setUser ] = useState(null);
    const { isAuthenticated, getSupabaseClient } = useAuth();
    
    useEffect(() => {
        function setError() { }
        function handleUser(data)
        {
            const userData = data.filter((user) => user.id == date.user2_id || user.id == date.user1_id);
            if (userData[0].id != currentUserID) setUser(userData[0])
            else setUser(userData[1])
        }
        const fetchData = async () => {
            await dbGetRequest('/users', handleUser, setError, isAuthenticated, getSupabaseClient);
        };
        fetchData();
    
    }, [ isAuthenticated, getSupabaseClient ]);

    // Format the date to a more readable format
    const formatDate = (isoDate) => {
        return new Date(isoDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    };
    const formatTime = (isoDate) => {
        const date = new Date(isoDate)
        const hours = date.getHours() % 12 || 12; // Convert to 12-hour format, use 12 for midnight
        const minutes = String(date.getMinutes()).padStart(2, '0'); // Ensure two digits for minutes
        const ampm = date.getHours() >= 12 ? 'pm' : 'am'; // Determine am/pm
        return `${hours}:${minutes} ${ampm}`;
    };    

    return (
        <div className="border border-gray-300 rounded-lg p-4 mb-4 shadow-md">
            <div className="flex items-center gap-4 mb-4">
                {user?.profile_picture ? (
                    <img
                        src={user?.profile_picture}
                        alt={`${user?.name}'s profile`}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                        {user?.name[0]}
                    </div>
                )}
                <div>
                    <h3 className="text-lg font-semibold">{user?.name}</h3>
                    <p className="text-sm text-gray-600">{user?.bio}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
            </div>
            
            {
                type == 'pending' &&
                <h1>{ user?.name } wants to schedule a date!</h1>
            }
            <strong className="text-bold">{formatDate(date_start)}</strong>
            <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm">
                    <span className="font-semibold">Start:</span> {formatTime(date_start)}
                </p>
                <p className="text-sm">
                    <span className="font-semibold">End:</span> {formatTime(date_end)}
                </p>
                <p className="text-sm">
                    <span className="font-semibold">Location:</span> BPlate
                </p>
            </div>

            {type === "pending" && (
                <div className="flex gap-4 justify-center">
                    <button
                        className="w-full bg-emerald-500 text-white py-2 rounded-md hover:bg-emerald-600 transition"
                        onClick={() => onConfirm(date.id, true)}
                    >
                        Confirm Date
                    </button>
                    <button
                        className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
                        onClick={() => onConfirm(date.id, false)}
                    >
                        Reject Date
                    </button>
                </div>
            )}
            {
                type == 'sent' &&
                <strong>Waiting for { user?.name } to respond...</strong>
            }
        </div>
    );
}

/**
 * Pending Dates Page
 * 
 * Displays Pending and Confirmed dates for the current user.
 * 
 * @param {Array<Object>} dates - Array of date objects, each dates represents a scheduled, pending, or rejected date
 *
 * @param {Object} date - An specific date object
 * @param {number} date.id - Unique id for the date.
 * @param {string} date.user1_id - ID of the current user.
 * @param {string} date.user2_id - ID of the other user involved.
 * @param {string} date.date_start - Start time of the date in ISO 8601 format ("YYYY-MM-DDTHH:MM:SS").
 * @param {string} date.date_end - End time of the date in ISO 8601 format ("YYYY-MM-DDTHH:MM:SS").
 * @param {string} date.status - Current status of the date. 3 valid values:
 *   - `"pending"`: The date has been requested by one user.
 *   - `"confirmed"`: The date has been confirmed by both users.
 *   - `"rejected"`: The date was rejected by one of the users.
 */
function PendingDatePage({ dates, user }) {
    const [ confirmedDates, setConfirmedDates ] = useState([]);
    const [ pendingDates, setPendingDates ] = useState([]);
    const [ sentDates, setSentDates ] = useState([]);
    const { isAuthenticated, getSupabaseClient } = useAuth();
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    const triggerToast = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    function confirmDate(dateId, dateStatus)
    {
        const date = dates.filter((date) => date.id == dateId)[0];
        const dateConfirmation = dateStatus ? 'confirmed' : 'rejected';
        const requestBody = { status: dateConfirmation, id: dateId }
        dbPatchRequest('/dates', requestBody, () => { }, () => { }, isAuthenticated, getSupabaseClient);
        if (dateStatus)
        {
            setConfirmedDates((prevDates) => [ ...prevDates, date ]);
            triggerToast('Date confirmed!')
        }
        else
        {
            triggerToast('Date rejected!')
        }
        setPendingDates((prevDates) =>
            prevDates.filter((date) => date.id !== dateId)
        );
    }

    useState(() => {
        setConfirmedDates(dates.filter((date) => date.status === "confirmed"))
        setPendingDates(dates.filter((date) => date.status === "pending" && date.user2_id == user?.id))
        setSentDates(dates.filter((date) => date.status === "pending" && date.user1_id == user?.id))
    }, [])

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold text-center text-blue-600">Confirmed Dates</h1>
            {confirmedDates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {confirmedDates.map((date, key) => (
                        <PendingDateCard key={key} date={date} currentUserID={user?.id} type={'confirmed'}/>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    No confirmed dates found.
                </div>
            )}
            <h1 className="text-2xl font-bold text-center text-blue-600">Pending Dates</h1>
            {pendingDates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingDates.map((date, key) => (
                        <PendingDateCard key={key} date={ date } currentUserID={ user?.id } type={'pending'} onConfirm={confirmDate}/>
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    No pending dates found.
                </div>
            )}
            <h1 className="text-2xl font-bold text-center text-blue-600">Sent Dates</h1>
            {sentDates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sentDates.map((date, key) => (
                        <PendingDateCard key={key} date={ date } currentUserID={ user?.id } type={'sent'} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-gray-500">
                    No pending dates found.
                </div>
            )}
            {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
        </div>
    );
}

export default PendingDatePage;