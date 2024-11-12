'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// fetch data from protected route
const fetchProtectedData = async (jwtToken) => {
    try {
        if (!jwtToken) {
            throw new Error('No token provided. User may not be authenticated.');
        }
        // make request to our dummy protected route
        const response = await fetch('http://localhost:8080/protected', {
            method: 'GET',
            headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
        },});
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        // return the response json
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching protected data:', error);
        return null;
    }
};

export default function LoginPage()
{
    const { login } = useAuth();
    const navigate = useNavigate();
    const [session, setSession] = useState(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    // Check for an active session on page load
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

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

    // Handle login to start a session
    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) {
            setMessage(error.message)
        } else {
            setMessage('Login successful!')
            // Try out a protected request to backend! (logging results to console)
            const jwtToken = data.session.access_token;
            try {
                const data = await fetchProtectedData(jwtToken); // call our route to backend
                if (data) {
                    console.log('We got data yay!', data);
                } else {
                    console.error('No data returned. Possible authentication failure?');
                }
            } catch (error) {
                console.error('Error fetching protected data:', error);
            }

            login();
            navigate('/home');
        }
    }

    // Handle logout to end the session
    const handleLogout = async () => {
        await supabase.auth.signOut()
        setMessage('Logged out successfully')
        setSession(null)
    }

    return (
        <div className="flex flex-col items-center space-y-8 pt-[80px] grow">
            {
                session ?
                    (
                        <div className="flex flex-col space-y-2 w-[300px]">
                            <h1 className="input input-bordered bg-white flex items-center gap-2 shadow-sm">
                                logged in                          
                            </h1>
                            <button onClick={handleLogout}>
                                log out
                            </button>
                        </div>
                    )
                    : (
                        <div className="flex flex-col items-center space-y-6">
                            <div className="flex flex-col space-y-2 w-[300px]">
                                <label className="input input-bordered bg-white flex items-center gap-2 shadow-sm">                        
                                    <input name="email" type="text" className="grow text-sm text-neutral-700 selection:bg-neutral-200" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                                </label>
                                <label className="input input-bordered bg-white flex items-center gap-2 shadow-sm">
                                    <input name="password" type="password" placeholder="Password" className="grow text-sm text-neutral-700 selection:bg-neutral-200"  value={password} onChange={(e) => setPassword(e.target.value)}/>
                                </label>
                            </div>
                            <button className="btn btn-sm shadow-sm px-8 h-[40px] rounded-full bg-blue-700 border-none text-white hover:bg-blue-300" onClick={handleLogin}>
                                Log In
                            </button>
                        </div>
                    )
            }
        </div>
    )
}