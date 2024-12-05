import './App.css';
import React, { useEffect } from 'react';
import LoginPage from './login/page';
import HomePage from './home/page';
import ProfilePage from './profilepage/page';
import ViewProfilesPage from './viewprofiles/ViewProfilesPage';
import WelcomePage from './welcome/page';
import QuizPage from './quiz/page';
import ProtectedRoute from './ProtectedRoute';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import SchedulePage from './schedule/page';

function App() {
    const { isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path='/welcome' element={<WelcomePage />} />            
            <Route path='/login' element={<LoginPage />} />
            <Route
                path='/home'
                element={
                    <ProtectedRoute>
                        <HomePage />
                    </ProtectedRoute>
                }
            />
            <Route path='/viewprofiles' element={<ViewProfilesPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/quiz' element={<QuizPage />} />
            <Route path='/schedule' element={<SchedulePage />} />
            <Route path="*" element={<Navigate to={!isLoading && isAuthenticated ? '/home' : '/welcome'} replace />} />
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