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
    // useEffect(() => {
    //     const supabase = getSupabaseClient();
    //     // Listen for auth state changes
    //     const { data: authListener } = supabase.auth.onAuthStateChange(
    //         (event, session) => {
    //             setSession(session)
    //         }
    //     )

    //     // Cleanup the listener on component unmount
    //     return () => {
    //         authListener.subscription.unsubscribe()
    //     }
    // }, [])

    useEffect(() =>
    {
        if(session) navigate ('/home')
    }, [session])

    const handleLogin = async () =>
    {
        const result = await login(email, password)
        if(result) navigate('/home');
    }

    return (
        <div className="flex flex-col items-center space-y-8 pt-[80px] grow">            
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
        </div>
    )
}