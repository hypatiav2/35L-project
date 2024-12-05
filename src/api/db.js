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
            let errorMessage = 'An error occurred while fetching data.'; // Default error message

            try {
                const error = await response.json(); // Attempt to parse JSON error
                errorMessage = error.message || errorMessage; // Use the error message from the response if available
            } catch (jsonError) {
                console.warn("Response is not JSON");
                errorMessage = `Error: ${response.statusText} (${response.status})`; // Fallback to status text
            }
            console.error('Error posting to API:', errorMessage);

            if (setError) setError(errorMessage);
            return;
        }

        const data = await response.json();
        if (setData) setData(data); // Set the data after receiving the response
        return data; // Return the data for further usage if needed
    } catch (err) {
        console.error('Possible network error:', err);
        if (setError) setError('Network error. Please check your connection and try again.');
        return;
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
            let errorMessage = 'An error occurred while posting data.'; // Default error message

            try {
                const error = await response.json(); // Attempt to parse JSON error
                errorMessage = error.message || errorMessage; // Use the error message from the response if available
            } catch (jsonError) {
                console.warn("Response is not JSON");
                errorMessage = `Error: ${response.statusText} (${response.status})`; // Fallback to status text
            }
            console.error('Error posting to API:', errorMessage);

            if (setError) setError(errorMessage);
            return;
        }

        const data = await response.json();
        if (setData) setData(data);
        return; // Return the data for further usage if needed
    } catch (err) {
        console.error('Network error:', err);
        if (setError) setError('Network error. Please check your connection and try again.');
        return;
    }
}

export async function dbPutRequest(endpoint, payload, setData, setError, isAuthenticated, getSupabaseClient) {
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
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // check for failed request
        if (!response.ok) {
            let errorMessage = 'An error occurred while putting data.'; // Default error message

            try {
                const error = await response.json(); // Attempt to parse JSON error
                errorMessage = error.message || errorMessage; // Use the error message from the response if available
            } catch (jsonError) {
                console.warn("Response is not JSON");
                errorMessage = `Error: ${response.statusText} (${response.status})`; // Fallback to status text
            }
            console.error('Error posting to API:', errorMessage);

            if (setError) setError(errorMessage);
            return;
        }

        const data = await response.json();
        setData(data); // Set the data after receiving the response
        return;
    } catch (err) {
        console.error('Network error:', err);
        if (setError) setError('Network error. Please check your connection and try again.');
        return;
    }
}

export async function dbDeleteRequest(endpoint, payload, setData, setError, isAuthenticated, getSupabaseClient) {
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

        const response = await fetch('http://localhost:8080/api/v1' + endpoint, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        // check for failed request
        if (!response.ok) {
            let errorMessage = 'An error occurred while putting data.'; // Default error message

            try {
                const error = await response.json(); // Attempt to parse JSON error
                errorMessage = error.message || errorMessage; // Use the error message from the response if available
            } catch (jsonError) {
                console.warn("Response is not JSON");
                errorMessage = `Error: ${response.statusText} (${response.status})`; // Fallback to status text
            }
            console.error('Error posting to API:', errorMessage);

            if (setError) setError(errorMessage);
            return;
        }

        const data = await response.json();
        setData(data); // Set the data after receiving the response
        return; // Return the data for further usage if needed
    } catch (err) {
        console.error('Network error:', err);
        if (setError) setError('Network error. Please check your connection and try again.');
        return;
    }
}