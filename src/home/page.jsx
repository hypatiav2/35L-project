import React from 'react';
import { useAuth } from '../AuthContext';
import Navbar from './navbar';

export default function HomePage() {
    const { logout } = useAuth();   

    return (
        <div>
            <Navbar/>
            <h1>Home Page</h1>
            <button onClick={logout}>Log Out</button>
        </div>
    );
}