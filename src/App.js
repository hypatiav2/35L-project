// src/App.js
import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

function App() {
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
    }

    return (
        <div style={{ textAlign: 'center' }}>
            <h1>Supabase Session Management</h1>
            {session ? (
                <>
                    <p>Welcome, {session.user.email}!</p>
                    <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleLogin}>Login</button>
                </>
            )}
            {message && <p>{message}</p>}
        </div>
    )
}

export default App
