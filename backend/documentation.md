# Documentation For Using Our Endpoints

Queries to our API should request `http://localhost:8080/api/v1/`

When testing the endpoint (not through the frontend), we need to manually supply a JWT to authenticate our requests.  

> Call the endpoint `https://<OUR_SUPABASE_URL_THING>/auth/v1/token?grant_type=password`  
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

## Availability

**`GET/api/v1/availability`**: get all timeslots for the current user.

Return:

	200 OK: list of availabilities returned in JSON format
		{
			"id": <unique ID for each timeslot> INT
			"user_id": <corresponding user> STRING
			"start_time": <HH:MM> STRING
			"end_time": <HH:MM> STRING
			"day_of_week": <Monday - Sunday> STRING
		}	    
	500 Internal Error: not able to get availability

**`POST /api/v1/availability`**: Adds a new time slot to `availability` for the current user.

Request Body: A JSON object representing the new availability (Overlapping availabilities will NOT be inserted)
	{
		"start_time": <Start time of the time slot in ISO 8601 format, e.g., "2024-11-28T10:00:00Z">,
		"end_time": <End time of the time slot in ISO 8601 format, e.g., "2024-11-28T11:00:00Z">,
		"day_of_week": <Day of the week, e.g., "Monday">
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
		"start_time": <New start time of the time slot in ISO 8601 format, e.g., "2024-11-28T10:00:00Z">,
		"end_time": <New end time of the time slot in ISO 8601 format, e.g., "2024-11-28T11:00:00Z">,
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

**`GET /api/v1/dates/{matchId}`**: Retrieves the dates corresponding to a specific matchId.

- If the matchId is not provided, returns all matchIds and their corresponding dates for the current user.
- matchId must be an integer > 0, provided in the request params (url)

Returns:
    200 OK: Returns a list of matches with their respective dates.
        {
            "match_id": <match_id> INT,
            "dates": [
                {
                    "id": <int>,
                    "match_id": <int>,
                    "date_start": "<date_start> ISO 8601 format",
                    "date_end": "<date_end> ISO 8601 format",
                    "is_confirmed": <boolean>
                },
                ...
            ]
        }
    500 INTERNAL SERVER ERROR: Returns an error message if an internal error occurs.
    400 BAD REQUEST: Returns an error message if the request is invalid (e.g., invalid matchId format).

**`POST /api/v1/dates`**: Inserts a new date associated with a particular matchId.

Request Body:
    {
        "match_id": <id of the match this date will correspond to> INT,
        "date_start": "<when the date will start> ISO 8601 format",
        "date_end": "<when the date will end> ISO 8601 format",
        "is_confirmed": <whether the date is confirmed; defaults to FALSE if not provided> BOOL
    }

Responses:
    200 OK: Returns the inserted date object upon successful creation.
		{
			"match_id": <match_id> INT,
			"date_start": "<date_start> ISO 8601 format",
			"date_end": "<date_end> ISO 8601 format",
			"is_confirmed": <boolean>
		}
    400 BAD REQUEST: Returns an error message if the request body is malformed or required fields are missing.

**`DELETE /api/v1/dates/{dateId}`**: Deletes a date based on the request parameter dateId.

Request URL Parameter:
	"dateId": <ID of the date to be deleted> INT

Returns:
	204 No Content: Indicates the date was successfully deleted.
	400 Bad Request: Returned if the date ID is not valid or cannot be converted to an integer.
	500 Internal Server Error: Returned if there is an error deleting the date or querying the database.

## Matches

**`GET /api/v1/matches`**: find the top matches for a user. (NOT FULLY IMPLEMENTED YET)

- Finds other users who have overlapping availability with the current user
- returns as a list "matches", with the other user's id and a similarity score between the two users

Request Body:
	{
		"count": <the number of matches to return, default 10> INT
		"offset": <The starting point for the results, default 0> INT
	}
	
> Example: with count = 20 and offset = 10, this GET will return the 10th to 30th most similar users to the current user, who have overlapping availability.

Returns:
	200 OK: Returns a list of matches
		{
			"user1_id": <current user> STRING
			"user2_id": <matched user> STRING
			"similarity_score": <similarity between user 1 and 2> FLOAT,
	    	"match_status": <if the match has been accepted> TEXT or NULL ('pending', 'accepted', 'rejected', null)
		}

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
		"id": <unique identifier for the user> STRING,
		"name": <user's name> STRING,
		"email": <UNIQUE email for the user> STRING,
		"bio": <short biography of the user> STRING
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


**`PUT /api/v1/vector`**: Inserts or updates the similarity vector for the current user. (NOT IMPLEMENTED YET)

Request Body:
    {
        "similarity_vector": <idk yet>
    }

Returns:
    200 OK: 
    idk:


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