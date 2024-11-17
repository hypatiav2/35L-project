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

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = {
            name: name,
            email: email,
            phone: phone,
            bio: bio,
        };

        console.log('Form Submitted:', formData);
        // Example: submitToBackend(formData);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <Navbar />
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
    );
}