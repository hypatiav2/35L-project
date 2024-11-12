import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import LoginPage from './login/page';
import HomePage from './home/page';
import ProfilePage from './profilepage/page';
import ProtectedRoute from './ProtectedRoute';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

function App() {
    const [ message, setMessage ] = useState('');
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:8080')
            .then(response => response.text())
            .then(data => setMessage(data))
            .catch(error => console.error('Error fetching message:', error));
    }, []);

    // Redirect on load
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        } else {
            navigate('/login');
        }
    }, [ isAuthenticated ]);

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/home"
                element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                }
            />
            <Route path='/profile' element={<ProfilePage/>} />
            <Route path="*" element={<Navigate to={isAuthenticated ? '/home' : '/login'} replace />} />
        </Routes>
    );
}

export default function AppWrapper() {
    return (
        <AuthProvider>
            <Router>
                <App />
            </Router>
        </AuthProvider>
    );
}