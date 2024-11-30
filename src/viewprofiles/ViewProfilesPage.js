import React, { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import { useAuth } from '../AuthContext';
import './ViewProfilesPage.css';

function ViewProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const { isAuthenticated, getSupabaseClient } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Get the current user's session using getSession() method
      const supabase = getSupabaseClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        const jwtToken = session?.access_token;

        if (jwtToken) {
          // Now make the request with the JWT token
          fetch('http://localhost:8080/api/v1/users', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${jwtToken}`,
              'Content-Type': 'application/json',
            },
          })
            .then(response => response.json())
            .then(data => setProfiles(data))
            .catch(err => console.error('Error fetching profiles:', err));
        } else {
          console.error('No JWT token available');
        }
      });
    } else {
      console.log('User is not authenticated');
    }
  }, [isAuthenticated, getSupabaseClient]); // Re-run if authentication state changes

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
