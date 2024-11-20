import React from 'react';

function ProfileCard({ profile }) {
  return (
    <div className="profile-card">
      <img
        src={`data:image/png;base64,${profile.profile_picture}`}
        alt={profile.name}
        className="profile-image"
      />
      <h2>{profile.name}</h2>
      <p>{profile.bio}</p>
      <p>{profile.email}</p>
    </div>
  );
}

export default ProfileCard;
