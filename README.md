# 35L-project


## Documentation for each otehr for now

### Frontend


### Backend

To test the functionality of our routes, we can use **postman** or something like that. First we need a valid JWT Token that we can pass along with all our future requests, which will be verified in our Go backend. The token expires after a little bit of time.  

We can simulate logging into our frontend and getting a valid token by calling supabase directly:  

> Call `https://<OUR_SUPABASE_URL_THING>/auth/v1/token?grant_type=password`  
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

The response should include the JWT token we need. When we call the routes we make, supply that as the jwt token. (In the headers field of the request, supply "Authorization": \<THE_TOKEN\>)

`http://localhost:8080/protected` is our current tester route to check our authentication middleware, and ther root `http://localhost:8080/` call should also work.  

#### **main.go**

Entry point to our go backend.  

1. Create a multiplexer using the `gorilla/mux` package. mux adds functionality to HTTP request routing.  
2. Call `RegisterRoutes` defined in `go-react-backend/routes`. This registers our backend routes.  
3. Wrap our router in a CORS handler. (Handles preflight request handling and specifies what origins can access resources).  


####  **Routes/routers.go**

Register routes and wrap them in authentication middleware.  

1. Define the handler function for each route by passing our `controller` functions, which implement the actual logic of the route.  
2. Wrap each route handler function in our auth middleware by calling `middlewares.AuthMiddleware()`.  

#### **Controllers** 

Deal with business logic for our route endpoints. Each file corresponding with a particular resource.  

**profile_controller.go**  

Deal with logic for accessing the profile table in our Supabase PostgreSQL database. Each function is implemented as a handler function that will be registered in `routes/routers.go`.  

1. `ProfileController` TEMP. Defines a dummy tester function that calls `repositories.GetProfileByUserID`. This should retrieve data from our `public.profiles` table in our db and return the formatted data.  

2. Our `PublicRoute` and `ProtectedRoute` test routes are still here.  

**schedule_controller.go**  

TBD  

> Maybe we can have a separate controller file for the implementation of our quiz logic? or we can put it in prolilecontroller since the reference vector for the quiz score i think will live in the profiles table.  

#### **Repositories**

Deal with actual data transfer to and from our Supabase SQL db. Use pgx to interact with the db.  

**profile_repository.go**  

1. Define a `Profile` struct that corresponds to the form of our profiles table in SQL.
2. `GetProfileByID` NOT IMPLEMENTED. Query our db for the profile corresponding to `userID`, and return a `Profile` struct or error if unsuccessful.  
3. IMPLEMENT SETTERS  

### Database (Supabase)

We use Supabase for authentication and for our postgres database.  

#### **public.profiles**  

User information. Each entry is tied to particular user. We use an user id that references `auth.users`, which contains IDs for all users, dealt with by supabases' authentication stuff.  

> `id`: uuid references auth.users(id) (PRIMARY KEY)  
> `updated_at` timestamp with time zone  
> `username` text (must be unique)  
> `full_name` text  
> `bio` text  
> `avatar_url` text (link to a user's images in our `avatar` bucket  

#### **public.availability**

Availability for users in the system. Each entry is a timeslot for which a particular user is available. A user's availability schedule is made up of all the entries corresponding to that user.  

> `id` Unique ID for the timeslot (PRIMARY KEY)  
> `user_id` link to auth.users (id)  
> `start_time` Start time of availability  
> `end_time` End time of availability  
> `created_at` Timestamp of entry creation now()  
> `updated_at` Timestamp of last update now()   

