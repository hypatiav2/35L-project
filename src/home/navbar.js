import React from 'react';
import './navbar.css';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-logo">B-DATE</div>
            <ul className="navbar-links">
                {/* <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li> */}
                <li><a href="/home">Profile</a></li>
            </ul>
        </nav>
    );
}