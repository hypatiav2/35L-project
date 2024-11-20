import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    return (
        <nav className="bg-white text-blue-600 px-6 py-4 shadow-lg">
            <div className="flex justify-between items-center">
                {/* Logo */}
                <div className="text-xl font-extrabold text-blue-800">b-date</div>

                {/* Navigation Links */}
                <ul className="flex space-x-4">
                    <NavComponent link="/home">Home</NavComponent>
                    <NavComponent link="/profile">Profile</NavComponent>
                </ul>
            </div>
        </nav>
    );
}