import React from 'react';
import Navbar from '../home/navbar';
import { useAuth } from '../AuthContext';
import { useState, useEffect } from 'react';
import { dbGetRequest, dbPatchRequest, dbPostRequest, dbPutRequest } from '../api/db';
import { useNavigate } from 'react-router-dom';
import defaultpfp from '../home/defaultpfp.png'

/**
 * Profile Page
 * 
 * @var {Object} users
 *   @property {string} id - Unique identifier for the user.
 *   @property {string} name - Name of the user.
 *   @property {string} email - Unique email of the user.
 *   @property {string} bio - Short biography of the user.
 *   @property {string} vector - Similarity vector for recommendations.
 *   @property {string} profile_picture - Base64-encoded profile picture string.
 */
export default function ProfilePage() {
    const { logout, isAuthenticated, isLoading, getSupabaseClient } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        id: null,
        name: "",
        email: "",
        bio: "",
        profile_picture: null
    })

    // load user data on mount
    useEffect(() => {
        console.log("loading user info...")
        dbGetRequest('/users/me', setUser, handleFetchError, isAuthenticated, getSupabaseClient);
        console.log("The name I am going to show: ", user.name);
        console.log("The picture I am going to show: ", user.profile_picture);
    }, [isAuthenticated, getSupabaseClient])

    useEffect(() => {
        if(!isLoading && !isAuthenticated) navigate("/welcome");
    }, [isAuthenticated])

    // update user and display success on post
    const handlePostUser = (user) => {
        alert('Profile created successfully!');
    }
    // make better error response later?
    const handlePostError = (error) => {
        alert(error);
        alert('Error creating profile. Check the console for details.');
    };
    const handleFetchError = (error) => {
        console.error("Failed to fetch user information on page load:", error);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            alert('You must be logged in to update your profile.');
            return;
        }

        // Read the profile picture file as a base64 string
        let profile_pictureBase64 = '';
        if (user.profile_picture) {
            const reader = new FileReader();
            reader.readAsDataURL(user.profile_picture);
            profile_pictureBase64 = await new Promise((resolve) => {
                reader.onload = () => resolve(reader.result.split(',')[1]);
            });
        }

        const formData = {
            name: user.name,
            bio: user.bio,
            profile_picture: profile_pictureBase64,
        };

        try {
            dbPatchRequest('/users', formData, handlePostUser, handlePostError, isAuthenticated, getSupabaseClient);  
            console.log("New profile: ", formData);
        } catch (error) {
            console.error('Unexpected error:', error);
        }
    };

    const handleSetUser = (value, target) => {
        let newUser = { ...user };
        switch(target) {
            case "name":
                newUser.name = value;
                break;
            case "bio":
                newUser.bio = value;
                break;
            case "profile_picture":
                newUser.profile_picture = value[0];
                break;
            default:
                console.error("Unexpected target for handleSetUser");
                break;
        }
        setUser(newUser);
    };

    return (
        <div>
            <Navbar />
            <div className="min-h-screen bg-gray-100 py-8 px-4">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">Edit Profile</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="flex flex-col">
                            <label htmlFor="profile_picture" className="text-gray-600 font-medium mb-2">Profile Picture:</label>
                                <div className="flex flex-col items-center mb-4">
                                    {/* Display current profile picture or default */}
                                    <div className="h-40 w-40 rounded-full overflow-hidden mb-2">
                                        <img
                                            src={
                                                user.profile_picture
                                                    ? user.profile_picture instanceof File
                                                        ? URL.createObjectURL(user.profile_picture) // Show preview for uploaded file
                                                        : `data:image/png;base64,${user.profile_picture}` // Show existing profile picture
                                                    : defaultpfp // Fallback to default profile picture
                                            }
                                            alt="Profile"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <input
                                        type="file"
                                        id="profile_picture"
                                        accept="image/*"
                                        onChange={(e) => handleSetUser(e.target.files, "profile_picture")}
                                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>



                        <div className="flex flex-col">
                            <label htmlFor="name" className="text-gray-600 font-medium mb-2">Name:</label>
                            <input
                                type="text"
                                id="name"
                                value={user.name}
                                onChange={(e) => handleSetUser(e.target.value, "name")}
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="bio" className="text-gray-600 font-medium mb-2">Bio:</label>
                            <textarea
                                id="bio"
                                value={user.bio}
                                onChange={(e) => handleSetUser(e.target.value, "bio")}
                                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows="4"
                            />
                        </div>
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
