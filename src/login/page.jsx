'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

function login(formData)
{
    console.log("MEOW!")
}
export default function LoginPage()
{
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
                            <button onSubmit={handleLogout}>
                                log out
                            </button>
                        </div>
                    )
                    : (
                        <form className="flex flex-col items-center space-y-6" onSubmit={handleLogin}>
                            <div className="flex flex-col space-y-2 w-[300px]">
                                <label className="input input-bordered bg-white flex items-center gap-2 shadow-sm">                        
                                    <input name="email" type="text" className="grow text-sm text-neutral-700 selection:bg-neutral-200" placeholder="Email" />
                                </label>
                                <label className="input input-bordered bg-white flex items-center gap-2 shadow-sm">
                                    <input name="password" type="password" placeholder="Password" className="grow text-sm text-neutral-700 selection:bg-neutral-200" />
                                </label>
                            </div>
                            <button className="btn btn-sm shadow-sm px-8 h-[40px] rounded-full bg-blue-700 border-none text-white hover:bg-blue-300" type="submit">
                                Log In
                            </button>
                        </form>
                    )
            }
        </div>
    )
}