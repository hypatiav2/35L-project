import './App.css';
import React, { useEffect } from 'react';
import LoginPage from './login/page';
import HomePage from './home/page';
import ProfilePage from './profilepage/page';
import WelcomePage from './welcome/page'
import ProtectedRoute from './ProtectedRoute';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

function App() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

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
            <Route path="*" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            
        </Routes>
    )
}

/*

    return (
        <Routes>
            <Route path="/welcome" element={<WelcomePage />} />

            
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
*/

export default function AppWrapper() {
    return (
        <AuthProvider>
            <Router>
                <App />
            </Router>
        </AuthProvider>
    );
}