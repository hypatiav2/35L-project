export async function dbGetRequest(endpoint, setData, setError, isAuthenticated, getSupabaseClient) {
    if (!isAuthenticated) {
        console.log('User is not authenticated');
        return; // Exit early if not authenticated
    }

    const supabase = getSupabaseClient();
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const jwtToken = session?.access_token;

        if (!jwtToken) {
            console.error('No JWT token available');
            return;
        }

        const response = await fetch('http://localhost:8080/api/v1' + endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        // check for failed request
        if (!response.ok) {
            const error = await response.json();
            console.error('Error posting to API:', error);

            if (setError) setError(error.message || 'An error occurred while fetching data.');
            return;
        }

        const data = await response.json();
        if (setData) setData(data); // Set the data after receiving the response
        return data; // Return the data for further usage if needed
    } catch (err) {
        console.error('Possible network error:', err);
        if (setError) setError('Network error. Please check your connection and try again.');
        throw err; // Re-throw error to propagate it if needed
    }
}

export async function dbPostRequest(endpoint, payload, setData, setError, isAuthenticated, getSupabaseClient) {
    if (!isAuthenticated) {
        console.log('User is not authenticated');
        return; // Exit early if not authenticated
    }

    const supabase = getSupabaseClient();
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const jwtToken = session?.access_token;

        if (!jwtToken) {
            console.error('No JWT token available');
            return;
        }

        const response = await fetch('http://localhost:8080/api/v1' + endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // check for failed request
        if (!response.ok) {
            const error = await response.json();
            console.error('Error posting to API:', error);

            if (setError) setError(error.message || 'An error occurred while fetching data.');
            return;
        }

        const data = await response.json();
        if (setData) setData(data);
        return data; // Return the data for further usage if needed
    } catch (err) {
        console.error('Network error:', err);
        if (setError) setError('Network error. Please check your connection and try again.');
        throw err; // Re-throw error to propagate it if needed
    }
}

export async function dbDeleteRequest(endpoint, payload, setData, isAuthenticated, getSupabaseClient) {
    if (!isAuthenticated) {
        console.log('User is not authenticated');
        return;
    }

    const supabase = getSupabaseClient();
    
    try {
        const { data: { session } } = await supabase.auth.getSession();
        const jwtToken = session?.access_token;

        if (!jwtToken) {
            console.error('No JWT token available');
            return;
        }

        const response = await fetch('http://localhost:8080' + endpoint, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        setData(data); // Set the data after receiving the response
        return data; // Return the data for further usage if needed
    } catch (err) {
        console.error('Error deleting data:', err);
        throw err; // Re-throw error to propagate it if needed
    }
}