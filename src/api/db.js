export async function dbGetRequest(endpoint, setData, isAuthenticated, getSupabaseClient) {
    if (isAuthenticated) {
        // Get the current user's session using getSession() method
        const supabase = getSupabaseClient();
        supabase.auth.getSession().then(({ data: { session } }) => {
            const jwtToken = session?.access_token;

            if (jwtToken) {
                // Now make the request with the JWT token
                fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`,
                        'Content-Type': 'application/json',
                    },
                })
                    .then(response => response.json())
                    .then(data => setData(data))
                    .catch(err => console.error('Error fetching data:', err));
            } else {
                console.error('No JWT token available');
            }
        });
    } else {
        console.log('User is not authenticated');
    }
}