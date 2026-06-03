# Backend Documentation

This section explains the Express/Node.js backend architecture.

## 1. Architecture Overview (MVC Pattern)
The backend follows a pattern similar to MVC (Model-View-Controller), though as an API, the "View" is just JSON responses.

- **Models (`/models`)**: Defines the structure of the data in the database (Mongoose Schemas).
- **Routes (`/routes`)**: Defines the API endpoints (URLs) and points them to the correct controller.
- **Controllers (`/controllers`)**: Contains the actual business logic (e.g., checking if a seat is available, saving a booking).
- **Middleware (`/middleware`)**: Functions that run *before* the controller. Usually used for authentication or validation.

## 2. API Request Lifecycle
What happens when the frontend requests `GET /api/trips`?

1. **Server.js:** The request hits the main Express app. It sees the URL starts with `/api/trips` and passes it to `tripRoutes.js`.
2. **tripRoutes.js:** The router looks for a `GET /` route. It finds it and sees it's connected to the `getAllTrips` function in the controller.
3. **tripController.js:** The `getAllTrips` function runs. It uses Mongoose to ask the database: `Trip.find({})`.
4. **Database:** MongoDB returns the trips.
5. **Response:** The controller wraps the data in a JSON object and sends it back to the frontend with a `200 OK` status.

## 3. Core Concepts

### Express Server (`server.js`)
This is the entry point. It initializes Express, connects to MongoDB, sets up global middleware (like CORS and JSON parsing), and defines the base URL paths for the different routers.

### Route Handling
Routes keep the code organized. Instead of having 100 routes in `server.js`, we group them by feature (e.g., all authentication routes go in `authRoutes.js`).

### Controllers
This is where the "heavy lifting" happens. 
- **Async/Await:** Database operations take time. Controllers use `async/await` so the server doesn't freeze while waiting for MongoDB to respond.
- **Why separate from routes?** It keeps routes clean and makes the logic easier to test and reuse.

### Middleware
Middleware sits in the middle of the request cycle.
- **Example:** `authMiddleware.js`. When a user requests to view their bookings (`GET /api/bookings/my-bookings`), the request first hits the auth middleware. The middleware checks if a valid JWT token is attached. If yes, it allows the request to proceed to the controller. If no, it blocks the request and returns a `401 Unauthorized` error.

## 4. Important Files Breakdown

### `backend/server.js`
- **Purpose:** Initializes the application.
- **Dependencies:** `express`, `mongoose`, `cors`, `dotenv`.
- **What breaks if removed:** The server won't start. The frontend won't be able to fetch any data.

### `backend/config/db.js`
- **Purpose:** Establishes the connection to the MongoDB Atlas cluster.
- **Why this pattern:** Abstracting the DB connection logic keeps `server.js` clean and allows for easy error handling if the connection fails.

### `backend/controllers/bookingController.js`
- **Purpose:** Handles everything related to reservations.
- **Incoming Flow:** Receives a request to create a booking containing `tripId`, `seatNumbers`, and `paymentDetails`.
- **Logic:** 
  1. Validates the trip exists.
  2. **CRITICAL:** Checks if the requested seats are still available (preventing double-booking).
  3. Updates the `Trip` document to mark those specific seats as booked.
  4. Creates a new `Booking` document in the database linked to the User and the Trip.
- **Response Flow:** Returns the confirmed booking details to the user.
