import React from 'react';
import { useAuth } from '../AuthContext';

export default function HomePage() {
  const { logout } = useAuth();

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={logout}>Log Out</button>
    </div>
  );
}