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
function PendingDatePage({ dates }) {
    const confirmedDates = dates.filter((date) => date.status === "confirmed");
    const pendingDates = dates.filter((date) => date.status === "pending");


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
                                Other user ID (TEMP): {date.user2_id}
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
            <h1 className="text-2xl font-bold text-center text-blue-600">Pending Dates</h1>
            {pendingDates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingDates.map((date) => (
                        <div
                            key={date.id}
                            className="border rounded-lg p-4 shadow-lg bg-white"
                        >
                            <div className="text-lg font-semibold text-gray-800">
                                Other user ID (TEMP): {date.user2_id}
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
                    No pending dates found.
                </div>
            )}
        </div>
    );
}

export default PendingDatePage;