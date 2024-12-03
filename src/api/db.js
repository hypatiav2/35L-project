export async function dbGetRequest(endpoint, setData, isAuthenticated, getSupabaseClient) {
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

        const response = await fetch('http://localhost:8080' + endpoint, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        setData(data); // Set the data after receiving the response
        return data; // Return the data for further usage if needed
    } catch (err) {
        console.error('Error fetching data:', err);
        throw err; // Re-throw error to propagate it if needed
    }
}

export async function dbPostRequest(endpoint, payload, setData, isAuthenticated, getSupabaseClient) {
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

        const response = await fetch('http://localhost:8080' + endpoint, {
            method: 'POST',
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
        console.error('Error posting data:', err);
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