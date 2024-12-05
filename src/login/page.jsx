'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage()
{
    const { login, getSupabaseClient } = useAuth();
    const [session, setSession] = useState(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate();

    // // Check for an active session on page load
    useEffect(() => {
        const supabase = getSupabaseClient();
        // Listen for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session)
            }
        )

        // Cleanup the listener on component unmount
        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [])

    useEffect(() =>
    {
        if(session) navigate ('/home')
    }, [session])

    const handleLogin = async () =>
    {
        const result = await login(email, password)
        if(result) navigate('/home');
    }

    const handleSignupClick = () => {
        navigate('/welcome');
      };

    return (

        <div className="flex flex-col h-screen font-sans">

            {/* Navigation bar */}

            <nav className="bg-white text-blue-600 px-6 py-4 shadow-lg flex justify-between items-center0">
                <div className="text-xl font-extrabold text-blue-800">b-date</div>
                <div
                    className="text-blue-600 font-semibold px-4 py-2 hover:text-white hover:bg-blue-600 rounded transition cursor-pointer"
                    onClick={handleSignupClick}
                >
                Sign Up
                </div>
            </nav>

             {/* Page content */}

             <div className="flex flex-col items-center space-y-8 pt-10 grow">            
                <div className="flex flex-col space-y-2 w-[300px]">
                    <label className="input input-bordered bg-white flex items-center gap-2 shadow-sm">                        
                        <input
                            name="email"
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </label>

                    <label className="input input-bordered bg-white flex items-center gap-2 shadow-sm">
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                </div>

                <button className="btn btn-sm shadow-sm px-8 h-[40px] rounded-lg bg-blue-700 border-none text-white hover:bg-blue-300" onClick={handleLogin}>
                    Log In
                </button>
            </div>
        </div>
    )
}

