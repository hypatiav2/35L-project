import React, { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import { useAuth } from '../AuthContext';
import './ViewProfilesPage.css';
import { dbGetRequest } from '../api/db';

function ViewProfilesPage() {
    const [ profiles, setProfiles ] = useState([]);
    const { isAuthenticated, getSupabaseClient } = useAuth();

    useEffect(() => {
        dbGetRequest('http://localhost:8080/api/v1/users', setProfiles, isAuthenticated, getSupabaseClient);
    }, [ isAuthenticated, getSupabaseClient ]);

    return (
        <div className="viewprofiles-container">
            <h1>View Profiles</h1>
            <div className="profile-grid">
                {profiles.length > 0 ? (
                    profiles.map(profile => (
                        <ProfileCard key={profile.id} profile={profile} />
                    ))
                ) : (
                    <p>No profiles available.</p>
                )}
            </div>
        </div>
    );
}

export default ViewProfilesPage;