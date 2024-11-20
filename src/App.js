import './App.css';
import React, { useEffect } from 'react';
import LoginPage from './login/page';
import HomePage from './home/page';
import ProfilePage from './profilepage/page';
import ViewProfilesPage from './viewprofiles/ViewProfilesPage';
import ProtectedRoute from './ProtectedRoute';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

function App() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect on load
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/viewprofiles');
        } else {
            navigate('/viewprofiles');
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
            <Route
                path="/viewprofiles"
                element={
                    <ProtectedRoute>
                        <ViewProfilesPage />
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