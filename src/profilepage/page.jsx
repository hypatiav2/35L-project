import React from 'react';
import Navbar from '../home/navbar';
import { useAuth } from '../AuthContext';
import { useState } from 'react';

export default function ProfilePage() {
    const { logout } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const { isAuthenticated, getSupabaseClient } = useAuth();

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alert('You must be logged in to update your profile.');
            return;
        }

        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        const jwtToken = session?.access_token;

        if (!jwtToken) {
            alert('Unable to retrieve authentication token. Please log in again.');
            return;
        }

        // Read the profile picture file as a base64 string
        let profilePictureBase64 = '';
        if (profilePicture) {
            const reader = new FileReader();
            reader.readAsDataURL(profilePicture);
            profilePictureBase64 = await new Promise((resolve) => {
                reader.onload = () => resolve(reader.result.split(',')[1]);
            });
        }

        const formData = {
            name,
            email,
            phone,
            bio,
            profile_picture: profilePictureBase64,
        };

        try {
            const response = await fetch('http://localhost:8080/api/v1/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`, // Use the JWT token
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const userData = await response.json();
                console.log('User created:', userData);
                alert('Profile created successfully!');
            } else {
                const errorData = await response.json();
                console.error('Error creating profile:', errorData);
                alert('Error creating profile. Check the console for details.');
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            alert('Unexpected error occurred. Check the console for details.');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="min-h-screen bg-gray-100 py-8 px-4">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Profile Page</h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col">
                            <label htmlFor="name" className="text-gray-600 font-medium mb-2">Name:</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-gray-600 font-medium mb-2">Email:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="phone" className="text-gray-600 font-medium mb-2">Phone Number:</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="bio" className="text-gray-600 font-medium mb-2">Bio:</label>
                            <textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows="4"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="profile-picture" className="text-gray-600 font-medium mb-2">Profile Picture:</label>
                            <input
                                type="file"
                                id="profile-picture"
                                accept="image/*"
                                onChange={(e) => setProfilePicture(e.target.files[0])}
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                    <div className="mt-6 text-center">
                        <button
                            onClick={logout}
                            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
