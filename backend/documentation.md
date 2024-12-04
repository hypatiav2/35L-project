# Documentation For Using Our Endpoints

When testing the endpoint (not through the frontend), we need to manually supply a JWT to authenticate our requests.  

> First call the endpoint `https://<OUR_SUPABASE_URL_THING>/auth/v1/token?grant_type=password`  
> 
> REQUEST HEADER:
> "Content-Type": application/json  
> "apikey": \<OUR\_API\_KEY\>  
>   
> 
> REQUEST BODY: (json)
> {  
>      "email": "admin@gmail.com",
>      "password": "123456"  
> }

The JWT is the value of "access_token". For all the following API queries, the format should be:
> Endpoint: `http://localhost:8080/api/v1/{remaining API route}`
> REQUEST HEADER:
> "Authorization": "Bearer <JWT_HERE>"


## Availability

**`GET /api/v1/availability`**: get all timeslots for the current user.

Return:

	200 OK: list of availabilities returned in JSON format
		{
			"id": <unique ID for each timeslot> INT
			"user_id": <corresponding user> STRING
			"start_time": <HH:MM:SS> STRING
			"end_time": <HH:MM:SS> STRING
			"day_of_week": <Monday - Sunday> STRING
		}	    
	500 Internal Error: not able to get availability


**`POST /api/v1/availability`**: Adds a new time slot to `availability` for the current user.

Request Body: A JSON object representing the new availability (Overlapping availabilities will NOT be inserted)
	{
		"start_time": <Start time of the time slot in HH:MM:SS format, e.g., "10:00:00">,
		"end_time": <End time of the time slot in HH:MM:SS format, e.g., "11:00:00">,
		"day_of_week": <Full day of the week, capitalized. e.g., "Monday">
	}

Return:
	200 OK: Returns a success message
	409 CONFLICT: Returns a JSON response indicating a time slot conflict with an existing entry:
	{
		"error": "overlap_detected",
		"message": "Time slot overlaps with an existing entry",
		"conflict": {
			"id": <ID of the conflicting availability entry>,
			"user_id": <User ID of the conflicting entry>,
			"start_time": <Start time of the conflicting entry>,
			"end_time": <End time of the conflicting entry>,
			"day_of_week": <Day of the week for the conflicting entry>
		}
	}

**`PUT /api/v1/availability`**: Updates an existing time slot in `availability` for the current user.

Request Body: A JSON object representing the updated availability entry
	{
		"id": <ID of the time slot to update, must be unique and exist in the database>,
		"start_time": <New start time of the time slot in HH:MM:SS format, e.g., "10:00:00">,
		"end_time": <New end time of the time slot in HH:MM:SS format, e.g., "11:00:00">,
		"day_of_week": <New day of the week, e.g., "Monday">
	}

Return:

	200 OK: Returns a success message indicating that the time slot was successfully updated.
	400 BAD REQUEST: Returns an error message indicating that the request is invalid or the update could not be processed.

**`DELETE /api/v1/availability`**: Deletes a time slot from `availability` by ID, if it belongs to the current user.

Request Body: A JSON object containing the ID of the time slot to delete:
	{
		"id": <ID of the time slot to delete, must be unique and associated with the current user>
	}

Return:
	200 OK: Returns a success message confirming that the time slot was deleted.
	400 BAD REQUEST: Returns an error message if the provided ID is in an invalid format or missing.
	500 INTERNAL ERROR: Returns an error message if the deletion operation fails due to server or database issues.

## Dates

**`GET /api/v1/dates/status?`**: Retrieves the dates for the current user. Optionally only get dates with a certain status by specifying the request url.

Request Params:

	"status" = "pending", "confirmed", "rejected"

Example:

	GET `/api/v1/dates/pending` would return only pending dates.

Returns:

	200 OK: Returns a list of matches with their respective dates.
	    {
			"id": <unique date id> INT,
			"user1_id": <current user id > STRING,
			"user2_id": <other user id > STRING,
			"date_start": "<date_start> ISO 8601 format",
			"date_end": "<date_end> ISO 8601 format",
			"status": <"pending", "confimed", "rejected">
	    }
	500 INTERNAL SERVER ERROR: Returns an error message if an internal error occurs.
	400 BAD REQUEST: Returns an error message if the request is invalid (e.g., invalid matchId format).

**`POST /api/v1/dates`**: Inserts a new date associated with a particular matchId.

Request Body:
	{
		"user2_id": <the other user ID> string
	    "date_start": "<when the date will start> ISO 8601 format",
	    "date_end": "<when the date will end> ISO 8601 format",
	}

Responses:

	    200 OK: Returns the inserted date object upon successful creation.
			{
				"id": <unique id> INT
				"user1_id": <current user id > STRING,
				"user2_id": <other user id > STRING,
				"date_start": "<date_start> ISO 8601 format (YYYY-MM-DDTHH:MM:SS)",
				"date_end": "<date_end> ISO 8601 format (YYYY-MM-DDTHH:MM:SS)",
				"status": <"pending", "confirmed", "rejected">
			}
	    400 BAD REQUEST: Returns an error message if the request body is malformed or required fields are missing.


**`PATCH /api/v1/dates`**: Update a date's status.

Request Body:
	{
		"id" = valid date ID
		"status" = "pending", "confirmed", "rejected"
	}

Example:
	PATCH `/api/v1/dates/1/confirmed` would confirm date with ID 1

Returns:

	200 OK: Return the updated date
		{
			"id": <unique id> INT
			"user1_id": <current user id > STRING,
			"user2_id": <other user id > STRING,
			"date_start": "<date_start> ISO 8601 format (YYYY-MM-DDTHH:MM:SS)",
			"date_end": "<date_end> ISO 8601 format (YYYY-MM-DDTHH:MM:SS)",
			"status": <"pending", "confirmed", "rejected">
		}
	500 INTERNAL SERVER ERROR: Returns an error message if an internal error occurs.
	400 BAD REQUEST: Returns an error message if the request is invalid (e.g., invalid matchId format).


**`DELETE /api/v1/dates/{dateId}`**: Deletes a date based on the request parameter dateId.

Request URL Parameter:
	"dateId": <ID of the date to be deleted> INT

Returns:
	204 No Content: Indicates the date was successfully deleted.
	400 Bad Request: Returned if the date ID is not valid or cannot be converted to an integer.
	500 Internal Server Error: Returned if there is an error deleting the date or querying the database.

## Matches

**`GET /api/v1/matches`**: find the top matches for a user.

Returns a list of Matches: each match corresponds to another user.
Each match has a sublist of availability timeslots, where both the current user and that user are available.
The list is sorted by the similarity score between [current user] and [other user].

Request Params:

	count: number of matches to return
	offset: offset from beginning of matches list to return from

> Example:
> count = 20 and offset = 10,
> `GET /api/v1/matches?count=20&offset=10` returns the 10th to 30th overlapping availability to the current user, sorted by similarity.

Returns:

	200 OK: Returns a list of matches, each match has a list of availabilities.
	[
		{ 
			"user1_id": current user id,
			"user2_id": match user's id,
			"similarity_score": 0.0 to 1.0,
			"availabilities": [
				{ 
					"id": 0,
					"user_id": match user's id,
					"start_time": "HH:MM:SS",
					"end_time": "HH:MM:SS",
					"day_of_week": "Monday"
				},
				... // MORE AVAILABILITIES
			]
		},
		... // MORE MATCH ENTRIES
	]


## Users

**`GET /api/v1/users`**: Retrieves a list of all users.

Return:
	200 OK: Returns a JSON array of users
	[
		{
			"id": <unique id for the user> STRING
			"name": <user's name> STRING
			"email": <user's UNIQUE email> STRING
			"bio": <user's bio> STRING
			"vector": <user's similarity vector> STRING
			"profile_picture": <base64-encoded image string, currently empty> STRING
		},
		...
	]

	500 INTERNAL ERROR: Returns an error message if the server is unable to retrieve users from the database.


**`POST /api/v1/users`**: Adds a new user to the db.

Request Body:
{
    "id": "<unique identifier for the user> STRING",
    "name": "<user's name> STRING",
    "email": "<unique email for the user> STRING",
    "bio": "<short biography of the user> STRING",
    "profile_picture": "<base64-encoded profile picture> STRING (optional)"
}


Return:

	200 OK: Returns the newly created user object on success, with all fields populated.
	400 BAD REQUEST: Returns an error message if the request body is not correctly formatted (e.g., missing or invalid fields).
	500 INTERNAL ERROR: Returns an error message if the server fails to insert the new user into the database.

**`PATCH /api/v1/users`**: Updates the profile of the current user.

Request Body: (If a field is not provided, it will not be changed)
	{
		"name": <new name for the user> STRING,
		"email": <UNIQUE email for the user> STRING,
		"bio": <short bio for the user> STRING,
		"profile_picture": <empty for now> STRING
	}

Return:

	200 OK: Returns the updated user object on success.
	400 BAD REQUEST: Returns an error message if the request body is not formatted correctly (e.g., missing or invalid fields).
	500 INTERNAL ERROR: Returns an error message if the server fails to update the user in the database.

**`DELETE /api/v1/users`**: delete any user

Request Body:
	{
		"id": <unique_id> STRING
	}

Return:

	200 OK: return success message on deletion
	400 BAD REQUEST: json formatted wrong
	500 INTERNAL ERROR: unable to insert

## Vector

**`GET /api/v1/vector`**: gets the similarity vector for the current user.

Returns:

	200 OK: Successful fetch
		{
			"similarity_vector": <json array of ints that is the similarity vector>
		}
	500 INTERNAL ERROR: Could not fetch user vector


**`PUT /api/v1/vector`**: Inserts or updates the similarity vector for the current user. (NOT IMPLEMENTED YET)

Request Body:
	{
	    "similarity_vector": <[json array of ints]>
	}

Returns:

	200 OK: Successful update
	400 BAD REQUEST: response body was not formatted correctly
	500 INTERNAL ERROR: Could not update


## User_Sync

**`POST/PUT/DELETE /api/v1/webhooks/users`**: Syncs user data in the system based on webhook events.

Request Body: JSON formatted WebhookPayload with the following structure
	{
		"event": <event type: "INSERT", "UPDATE", or "DELETE">
		"record": <JSON representation of the user data>
	}

EXAMPLE:
	{
		"event": "INSERT",
		"record": {
			"id": "123423rgoisdnczxfmd",
			"name": "Timothy",
			"email": "bruin@ucla.edu",
			"bio": "loves to climb",
			"vector": null,
			"profile_picture": "https://example.com/images/johndoe.jpg"
		}
	}

Return:

	200 OK: Webhook processed successfully (user inserted, updated, or deleted)
	500 INTERNAL ERROR: If an error occurs while processing the request or interacting with the database
	400 BAD REQUEST: If the event type is unsupported or if the payload is malformed