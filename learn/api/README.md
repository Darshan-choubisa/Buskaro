# API Documentation

This document outlines the RESTful API endpoints available in the backend.

Base URL: `http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

### Register a User
- **Method:** `POST`
- **Endpoint:** `/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (201):** `{ "message": "User registered successfully", "token": "jwt_string_here" }`

### Login a User
- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Body:** `{ "email": "john@example.com", "password": "securepassword123" }`
- **Response (200):** Returns user details and a JWT token for future requests.

---

## 2. Trips (`/api/trips`)

### Get All Trips (or Search)
- **Method:** `GET`
- **Endpoint:** `/trips`
- **Query Params (Optional):** `?source=Mumbai&destination=Pune`
- **Response (200):** Array of Trip objects.

### Get Single Trip by ID
- **Method:** `GET`
- **Endpoint:** `/trips/:id`
- **Response (200):** Single Trip object containing bus layout, price, and booked seats.

---

## 3. Bookings (`/api/bookings`)

*Note: All endpoints below require a valid JWT token in the `Authorization` header.*

### Create a New Booking
- **Method:** `POST`
- **Endpoint:** `/bookings`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "tripId": "60d5ecb8b392...",
    "seats": ["1A", "1B"],
    "totalAmount": 1500
  }
  ```
- **Response (201):** The newly created booking document.

### Get My Bookings
- **Method:** `GET`
- **Endpoint:** `/bookings/my-bookings`
- **Headers:** `Authorization: Bearer <token>`
- **Response (200):** Array of Booking objects belonging to the logged-in user.

---

## 4. Admin (`/api/admin`)

*Note: Require JWT token of a user with `role: 'admin'`.*

### Get Dashboard Stats
- **Method:** `GET`
- **Endpoint:** `/admin/stats`
- **Response (200):** Aggregate data (total users, total revenue, active buses).

### Add a New Bus Trip
- **Method:** `POST`
- **Endpoint:** `/admin/buses`
- **Body:** Trip details (source, destination, price, etc.)
- **Response (201):** The created Trip object.
