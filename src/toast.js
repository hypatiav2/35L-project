export function Toast({ message, onClose }) {
    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-8 py-4 rounded shadow-md z-50">
            {message}
            <button
                className="ml-4 text-red-300 hover:text-red-500"
                onClick={onClose}
            >
                ✕
            </button>
        </div>
    );
}