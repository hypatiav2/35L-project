// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const AuthContext = createContext();

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

export function AuthProvider({ children }) {
    const [ isAuthenticated, setIsAuthenticated ] = useState(false);

    useEffect(() => {        
        supabase.auth.getSession().then(({ data: { session } }) => {
            setIsAuthenticated(!!session)
        })
    }, [])

    async function signUp(email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                console.error('Error signing up:', error.message);
                return { success: false, message: error.message };
            }

            console.log('Sign-up successful:', data);
            const session = data.session;
            setIsAuthenticated(!!session);

            return {
                success: true,
                message: session
                    ? 'Sign-up successful! You are logged in.'
                    : 'Sign-up successful! Please verify your email.',
            };
        } catch (err) {
            console.error('Unexpected error during sign-up:', err);
            return { success: false, message: 'An unexpected error occurred.' };
        }
    }

    async function login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) {
            console.error(error.message)
            return false;
        } else {
            console.log('Login successful!')
            // Try out a protected request to backend! (logging results to console)
            const jwtToken = data.session.access_token;
            setIsAuthenticated(true);
            return true;
        }
    }

    async function logout() {
        setIsAuthenticated(false);
        await supabase.auth.signOut();
    };

    function getSupabaseClient() 
    {
        return supabase
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, signUp, login, logout, getSupabaseClient }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}