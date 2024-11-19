# 35L-project

*Documentation for each other for now*

1. [Frontend](#frontend)
2. [Backend](#backend)
   - [main.go](#main.go)
   - [Routes](#routes)
   - [Controllers](#controllers)
   - [Repositories](#repositories)
3. [Supabase](#database-(supabase))
   - [Profiles](#public.profiles)
   - [Availability](#public.availability)

## Frontend

TBD AARUSH

## Backend

### Testing Backend

To test the functionality of routes, we can use **postman** or something like it. We need a valid JWT token to pass along with all our requests, since our backend verifies authentication. Any given token also expires after a little bit of time.  

We can call supabase directly to get a valid token, simulating logging into our frontend.  

> Call the endpoint `https://<OUR_SUPABASE_URL_THING>/auth/v1/token?grant_type=password`  
> In the request header include...  
>  
> "Content-Type": application/json  
> "apikey": \<OUR\_API\_KEY\>  
>   
> In the body include raw JSON with a valid login...  
>   
> ```{  
>      "email": "admin@gmail.com",
>      "password": "123456"  
> }```  

The response should include the JWT token we need. When we call routes to our backend, supply that as the JWT token. (supply "Authorization": \<THE_TOKEN\> in the headers field).

`http://localhost:8080/protected` is our current tester route to check our authentication middleware, and ther root `http://localhost:8080/` call should also work.  


### main.go

Entry point to our go backend.  

1. Import .env variables globally to our backend.  
2. Create a connection pool manager -> connects to our db and allows reusable connections for multiple requests.
3. Create a multiplexer using the `gorilla/mux` package. mux allows grouping and stuff for HTTP request routing.  
4. Call `RegisterRoutes` defined in `go-react-backend/routes`. This registers our backend routes.  
5. Wrap our router in a CORS handler. (Handles preflight request handling and specifies what origins can access resources).  


### ROUTES

Register routes and wrap them in authentication middleware.  

1. Define the handler function for each route by passing our `controller` functions, which implement the actual logic of the route.  
2. Wrap each route handler function in our auth middleware by calling `middlewares.AuthMiddleware()`.  

**Current Routes:** TBD

### CONTROLLERS 

*Deal with business logic for our route endpoints. Each file corresponds with a particular resource.*  

**profile_controller.go**  

Logic for accessing the **profile** table in our Supabase PostgreSQL database. Create handler functions that will be registered to our routes in `routes/routers.go`.  

TBD BY MERYL
1. `ProfileController`: TEMP. Defines a dummy tester function that calls `repositories.GetProfileByUserID`. This should retrieve data from our `public.profiles` table in our db and return the formatted data.  
2. Our `PublicRoute` and `ProtectedRoute` test routes are still here.  

**availability_controller.go**  

Logic for accessing the **availability** table in our db.  

1. `GetAvailability` Retrieves all availability entries for a given user, returned as JSON with a user_id and list of tstzrange-formatted time slots.  
2. `InsertAvailability`  Expects a request body in JSON form, with a start and end time field. Time should be specified in ISO 8601 format, `YYYY-MM-DDTHH:MM:SSZ`.  

KNOWN BUGS:
Sometimes does not query correctly due to a failed to query availability: Named prepared cache is having some issue... `ERROR: prepared statement already exists (SQLSTATE 42P05)`


**quiz_controller.go**

We can either have a separate controller file for our quiz logic, or we can put it all in prolile_controller since the reference vector for the quiz score will probably live in the profiles table. TBD BY TIFF

### REPOSITORIES

Deal with actual data transfer to and from our Supabase SQL db. Use pgx to interact with the db.  

**profile_repository.go**  

1. Define a `Profile` struct that corresponds to the form of our profiles table in SQL.
2. `GetProfileByID` NOT IMPLEMENTED. Query our db for the profile corresponding to `userID`, and return a `Profile` struct or error if unsuccessful.  
3. IMPLEMENT SETTERS  

**availability_repository.go**  

1. `GetAvailabilityForUserID` retrieves the availability time slots for a given user. Queries the availability table for a user by their userID and returns a list of time slots in the form of a Schedule struct.  
2. `InsertAvailability` inserts a new availability time slot for a user into the availability table. Accepts a userID and a timeSlot (in tstzrange format) and stores them in the database.  

## Database (Supabase)

We use Supabase for authentication and for our postgres database.  

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


