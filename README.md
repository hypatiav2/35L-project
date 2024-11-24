# 35L-project

*Documentation for each other for now*

1. [Frontend](#frontend)
2. [Backend](#backend)
   - [Testing](#testing)
   - [Route Endpoints](#route-endpoints)
   - [Controllers](#controllers)
   - [Repositories](#repositories)
3. [Supabase](#database-(supabase))
   - [Profiles](#public.profiles)
   - [Availability](#public.availability)

## Frontend

TBD

## Backend

> ToDo:  
> 1. Make init_db not another main function
> 2. 
> 3. Implement profile/availability endpoints (POST, DELETE, PUT)
> 4. tie our user table to real user data, access with real user id

### Testing

To test routes, we can use **postman** or **curl**. We need a valid JWT token to pass along with all our requests, since our backend verifies authentication. Tokens expire after some time.  

We can call supabase directly to get a valid token, simulating logging into our frontend.  

> Call the endpoint `https://<OUR_SUPABASE_URL_THING>/auth/v1/token?grant_type=password`  
> In the request header include...  
>  
> "Content-Type": application/json  
> "apikey": \<OUR\_API\_KEY\>  
>   
> In the body include raw JSON with a valid login...  
>   
> {  
>      "email": "admin@gmail.com",
>      "password": "123456"  
> } 

The response should include the JWT token we need. When we call routes to our backend, supply that as the JWT token. ( "Authorization": \<THE_TOKEN\> in the headers field).

### Route Endpoints

**profiles**
GET/api/v1/profiles: Retrieve JSON list of users
POST/api/v1/profiles: add a new user.
PATCH/api/v1/profiles: update the CURRENT user. 
DELETE/api/v1/profiles: delete any user. 

**availability**
GET/api/v1/availability: get all timeslots for the current user.
POST/api/v1/availability: add one new timeslot to `availability` for the current user.
PUT/api/v1/availability: update a timeslot in `availability` for the current user.
DELETE/api/v1/availability: delete a timeslot by ID from `availability`, if it belongs to the current user.

**search**
GET/api/v1/search: get list of users with overlapping availability with current user. List ranked by similarity.

**webhooks** 
POST/api/v1/webhooks/users: insert new user. Automatically called by supabase. 
PATCH/api/v1/webhooks/users: Same as above.
DELETE/api/v1/webhooks/users: Same as above.

* Still need to implement webhook on Supabase. Also will not work when running server locally.  


### main.go

Entry point to our go backend.  

1. Create a multiplexer using the `gorilla/mux` package. mux allows grouping and stuff for HTTP request routing.
2. Import .env variables globally.
3. Create connection pool. Connects to our db and allows reusable connections for multiple requests.
4. Call `RegisterRoutes` defined in `go-react-backend/routes`. Registers our backend routes.  
5. Wrap our router in a CORS handler. (Handles preflight request handling and specifies what origins can access resources).  

### routes.go

1. Wrap routes in `middleware.AuthMiddleware()`. Authenticates and adds userID to request context.  
2. Wrap routes in `middleware.DbMiddleware()`. Adds sql.DB to request context.  
3. Define the handler function for each route by passing our `handler` functions, which implement the logic of the route.  

### Handlers 

*Deal with business logic for our route endpoints. Each file corresponds with a particular resource.*  

**profile.go**  

Logic for accessing the **profile** table in our Supabase PostgreSQL database. Create handler functions that will be registered to our routes in `routes/routers.go`.  

TBD BY MERYL

**availability.go**  

Logic for accessing the **availability** table in our db.  

IDK

**quiz.go**

We can either have a separate controller file for our quiz logic, or we can put it all in prolile_controller since the reference vector for the quiz score will probably live in the profiles table. TBD BY TIFF

### Models

Deal with actual data transfer to and from our Supabase SQL db. Use pgx to interact with the db.  

**profile.go**  

1. Define a `Profile` struct that corresponds to the form of our profiles table in SQL.
2. `GetProfileByID` NOT IMPLEMENTED. Query our db for the profile corresponding to `userID`, and return a `Profile` struct or error if unsuccessful.  
3. IMPLEMENT SETTERS  

**availability.go**  

1. `GetAvailabilityForUserID` retrieves the availability time slots for a given user. Queries the availability table for a user by their userID and returns a list of time slots in the form of a Availability struct.  
2. `InsertAvailability` TBD

## Database (SQLite)

We use Supabase for authentication and Sqlite our postgres database.  

### public.profiles  

User information. Each entry is tied to particular user. We use an user id that references `auth.users`, which contains IDs for all users, dealt with by supabases' authentication stuff.  

> `id`: uuid references auth.users(id) (PRIMARY KEY)  
> `updated_at` timestamp with time zone  
> `username` text (must be unique)  
> `full_name` text  
> `bio` text  
> `avatar_url` text (link to a user's images in our `avatar` bucket)

#### RLS Policies  
- SELECT: Profiles are viewable by everyone.  
- INSERT: Users can insert their own profile.  
- UPDATE: Users can update own profile.  

### public.availability

Availability for users in the system. Each entry is a timeslot for which a particular user is available. A user's availability schedule is made up of all the entries corresponding to that user.  

> `id` Unique ID for the timeslot (PRIMARY KEY)  
> `user_id` link to auth.users (id)  
> `duration` tstzrange that captures the duration of a timeslot
> `created_at` Timestamp of entry creation now()  
> `updated_at` Timestamp of last update now()   

All entries corresponding to a single user_id must have unique timeslots. Overlapping time slots are not allowed for a single user.

#### RLS Policies
- SELECT: Enable read access for all users.  
- INSERT: Enable insert for users based on user_id.  

Examples of manipulating the table...

    INSERT INTO availability (user_id, duration)
    VALUES (auth.uid(), tstzrange('2024-01-01 10:00:00+00', '2024-01-01 12:00:00+00'));

    UPDATE availability
    SET duration = tstzrange('2024-01-01 11:00', '2024-01-01 13:00')
    WHERE user_id = auth.uid()
      AND id = 'specific-availability-id';


