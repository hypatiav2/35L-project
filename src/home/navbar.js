import React from 'react';
import './navbar.css';
import { useNavigate } from 'react-router-dom';

function NavComponent({ link, children})
{
    const navigate = useNavigate();
    return <li><button onClick={() => navigate(link)}>{children}</button></li>
}

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-logo">B-DATE</div>
            <ul className="navbar-links">
                {/* <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li> */}
                <NavComponent link='/home'>Home</NavComponent>
                <NavComponent link='/profile'>Profile</NavComponent>
            </ul>
        </nav>
    );
}