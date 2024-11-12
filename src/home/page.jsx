import React from 'react';
import { useAuth } from '../AuthContext';
import Navbar from './navbar';

export default function HomePage() {

    return (
        <div>
            <Navbar/>
            <h1>Home Page</h1>
        </div>
    );
}