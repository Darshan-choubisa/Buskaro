# START HERE: Your Learning Roadmap

Welcome to your custom MERN stack course based on your own code! Follow this guide to understand how your project connects.

## 1. The Recommended Order to Study

To understand how everything works together, don't just read files randomly. Follow this specific sequence:

### Step 1: The Foundation (Database)
**Always start with the data.** If you understand how data is structured, the rest of the app makes sense.
- Read: `/learn/database/README.md`
- Look at files: `backend/models/User.js`, `backend/models/Trip.js`, `backend/models/Booking.js`
- **Goal:** Understand what a "User", "Trip", and "Booking" look like in the database.

### Step 2: The Logic (Backend API)
Once you know the data structure, look at how we expose that data to the frontend.
- Read: `/learn/backend/README.md` and `/learn/api/README.md`
- Look at files: `backend/server.js` (entry point), `backend/routes/tripRoutes.js`, `backend/controllers/tripController.js`
- **Goal:** Understand how a request like `GET /api/trips` actually fetches data from MongoDB and sends it back.

### Step 3: The UI (Frontend)
Now see how the user interacts with the data.
- Read: `/learn/frontend/README.md`
- Look at files: `src/App.jsx` (Routing), `src/pages/Home.jsx` (Search), `src/pages/trips.jsx` (Results)
- **Goal:** Understand how the React app calls the backend API and renders the data onto the screen using Tailwind.

### Step 4: Connecting the Dots (Flow & Auth)
This is where the magic happens. How do we ensure a user is who they say they are, and how do we process a complex action like booking a ticket?
- Read: `/learn/flow/README.md` and `/learn/auth/README.md`
- Look at files: `backend/middleware/authMiddleware.js`, `src/pages/Login.jsx`, `src/pages/Payment.jsx`
- **Goal:** Trace a complete user journey from logging in, to searching, selecting a seat, and paying.

### Step 5: Going Live & Improving (Deployment & Best Practices)
- Read: `/learn/deployment/README.md` and `/learn/best-practices/README.md`
- **Goal:** Learn how to put this app on the internet and how to make the code cleaner and more secure for a real company.

## 2. Most Important Files to Master

If you only study a few files, make sure you deeply understand these:
- **`backend/server.js`**: The heart of the backend. It connects to the database, sets up middleware, and registers routes.
- **`src/App.jsx`**: The skeleton of the frontend. It controls which component shows up based on the URL.
- **`backend/controllers/bookingController.js`**: Contains the most complex business logic (creating a booking, checking seat availability).
- **`src/context/BookingContext.jsx`**: Shows how data (like selected seats) is shared across multiple pages without "prop drilling".
- **`backend/middleware/authMiddleware.js`**: Crucial for security. Understand how it intercepts requests to check for valid tokens.

## 3. How Frontend, Backend, and Database Interact

Here is the "Big Picture" sequence for almost any action in your app:

1. **User Action (Frontend):** A user clicks a button (e.g., "Search Buses").
2. **React Logic (Frontend):** A function is triggered (e.g., `handleSearch`).
3. **HTTP Request (Frontend -> Backend):** Axios sends an HTTP request (e.g., `GET /api/trips?source=X&destination=Y`) to the backend server.
4. **Route Match (Backend):** Express sees the request and routes it to the specific controller function (e.g., `searchTrips`).
5. **Database Query (Backend -> Database):** The controller uses Mongoose to ask MongoDB for data (`Trip.find(...)`).
6. **Data Return (Database -> Backend):** MongoDB sends the raw JSON data back to the Express controller.
7. **HTTP Response (Backend -> Frontend):** The controller sends the JSON data back to the React app with a status code (e.g., `200 OK`).
8. **UI Update (Frontend):** React takes the JSON data, updates its state (e.g., `setTrips(data)`), and the screen re-renders to show the new information to the user!
