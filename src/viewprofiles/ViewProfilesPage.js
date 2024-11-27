import React, { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import './ViewProfilesPage.css';

function ViewProfilesPage() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/users')
      .then(response => response.json())
      .then(data => setProfiles(data))
      .catch(err => console.error('Error fetching profiles:', err));
  }, []);

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
