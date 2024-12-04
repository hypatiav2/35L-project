import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function NavComponent({ link, children }) {
    const navigate = useNavigate();
    return (
        <li>
            <button
                onClick={() => navigate(link)}
                className="text-blue-600 font-semibold px-4 py-2 hover:text-white hover:bg-blue-600 rounded transition"
            >
                {children}
            </button>
        </li>
    );
}

export default function Navbar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout(); // Try to logout
            navigate('/welcome'); // Redirect to login page after logging out
        } catch (error) {
            console.error('Logout failed:', error);
            alert('An error occurred during logout. Please try again.');
        }
    };

    return (
        <nav className="bg-white text-blue-600 px-6 py-4 shadow-lg">
            <div className="flex justify-between items-center">
                {/* Logo */}
                <div className="text-xl font-extrabold text-blue-800">b-date</div>

                {/* Navigation Links */}
                <ul className="flex space-x-4">
                    <NavComponent link="/home">Home</NavComponent>
                    <NavComponent link="/profile">Profile</NavComponent>
                    <NavComponent link="/schedule">Schedule</NavComponent>
                    <NavComponent link="/quiz">Quiz</NavComponent>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="text-red-600 font-semibold px-4 py-2 hover:text-white hover:bg-red-600 rounded transition"
                    >
                        Log Out
                    </button>
                </ul>

                
            </div>
        </nav>
    );
}