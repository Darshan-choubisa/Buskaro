# BusKaro - Viva Exam Preparation Guide

This guide is prepared to help you explain your project (BusKaro) during your Viva. It uses simple language, concrete code references, and covers how the frontend connects to the backend, the technologies used, API details, and bugs we fixed.

---

## 1. Project Architecture (How Frontend Connects to Backend)

Our application is built on the **MERN** stack (MongoDB, Express, React, Node.js). 

### How does the React Frontend talk to the Node.js Backend?
We use a library called **Axios** to make HTTP requests to our server's REST API. 

*   **API Configuration File**: [src/utils/api.js](file:///c:/Users/Darshan/Desktop/Inst/travel%20(1)/travel/src/utils/api.js)
    *   This file creates an Axios instance with a `baseURL` pointing to our server: `http://localhost:5001/api`.
    *   **Axios Interceptor** (Line 11-22): On every request, it automatically grabs the JWT security token from `localStorage` (`localStorage.getItem('token')`) and attaches it in the headers as `Authorization: Bearer <token>`. This ensures the backend knows who the logged-in user is.

### Navigation/Routing
We use **React Router** in [src/App.jsx](file:///c:/Users/Darshan/Desktop/Inst/travel%20(1)/travel/src/App.jsx) to navigate between pages (e.g., from Home, to Seat Selection, to Payment, to My Bookings).

---

## 2. Key User Flows & Backend Connection

Here is how you navigate the examiner through the code connection for key features:

### Flow A: User Login & Security
1.  **Frontend**: [src/pages/Login.jsx](file:///c:/Users/Darshan/Desktop/Inst/travel%20(1)/travel/src/pages/Login.jsx)
    *   User inputs their email and password.
    *   To prevent sending plain text passwords across the network, we encrypt the password on the client-side using `CryptoJS.AES` encryption.
    *   We send a POST request to `/api/auth/login`.
2.  **Backend Controller**: [backend/controllers/authController.js](file:///c:/Users/Darshan/Desktop/Inst/travel%20(1)/travel/backend/controllers/authController.js#L61)
    *   The `login` function receives the request.
    *   It decrypts the password (Line 64) and looks up the user in MongoDB.
    *   If correct, it generates a JWT token (Line 78) and sends it back to the React app.
3.  **Frontend Success**: The React app saves the token and user details to `localStorage` and navigates to the bookings/search page.

### Flow B: Ticket Booking & Payment
1.  **Frontend**: [src/pages/Payment.jsx](file:///c:/Users/Darshan/Desktop/Inst/travel%20(1)/travel/src/pages/Payment.jsx#L209)
    *   We send a POST request to `/api/bookings` with the selected trip ID, seats, and total amount.
2.  **Backend Controller**: [backend/controllers/bookingController.js](file:///c:/Users/Darshan/Desktop/Inst/travel%20(1)/travel/backend/controllers/bookingController.js#L23)
    *   `createBooking` is called. It creates a booking in MongoDB with a status of `pending`.
    *   It initiates a payment order using **Razorpay SDK** (Line 85). If we are running in a local demo/test environment, it falls back to a sandbox/demo order ID (Line 114).
3.  **Frontend Verification**:
    *   The user pays via Razorpay (or simulates success in Sandbox Mode).
    *   The React app calls POST `/api/bookings/verify` (Line 258 or 434 of `Payment.jsx`).
    *   The backend's `verifyPayment` in `bookingController.js` (Line 139) confirms the signature, changes the booking status to `confirmed`, decreases available seats on the trip, and returns a success response.
    *   The React app calls `addBooking(...)` in `BookingContext.jsx` to update the state and navigates to `/my-bookings`.

### Flow C: Ticket Cancellation & Refund
1.  **Frontend**: [src/pages/CancelTicket.jsx](file:///c:/Users/Darshan/Desktop/Inst/travel%20(1)/travel/src/pages/CancelTicket.jsx#L104)
    *   User selects a reason and clicks "Confirm Cancellation".
    *   We call PUT `/api/bookings/:bookingId/cancel`.
2.  **Backend Controller**: [backend/controllers/bookingController.js](file:///c:/Users/Darshan/Desktop/Inst/travel%20(1)/travel/backend/controllers/bookingController.js#L303)
    *   `cancelBooking` is called.
    *   It calculates the refund percentage based on how many days before departure the booking is cancelled (using backend policy logic).
    *   It creates a `Refund` record in MongoDB (Line 360) with a status of `pending` for Admin approval.
    *   It updates the booking status to `cancelled` and restores the seats back to the trip.
3.  **Frontend Success**: The React app updates context via `cancelBookingInContext` and navigates to [src/pages/CancellationSuccess.jsx](file:///c:/Users/Darshan/Desktop/Inst/travel%20(1)/travel/src/pages/CancellationSuccess.jsx).

---

## 3. Why we use these Technologies (Rationale)

If they ask "Why did you use X instead of Y?", use these simple answers:

*   **React Context API (`BookingContext.jsx`)**: 
    *   *Why*: To share booking data across different components (like MyBookings, CancelTicket, and Payment) without having to pass props down manually through multiple levels of components (prop drilling).
*   **JSON Web Tokens (JWT)**:
    *   *Why*: It's a secure, stateless way to authenticate users. Once logged in, the server signs a token, and the client sends it in the header for protected requests. The server doesn't need to save sessions in memory.
*   **MongoDB & Mongoose**:
    *   *Why*: MongoDB is a NoSQL database that stores data in JSON-like documents. This matches JavaScript data structures perfectly. Mongoose provides a schema structure and validation to make database querying easier.
*   **Razorpay SDK**:
    *   *Why*: A popular, developer-friendly payment gateway in India that supports UPI, Cards, and Netbanking. It provides easy-to-use testing keys and checkout modal.

---

## 4. API Endpoints: Requests & Outputs

Here is what the API looks like during testing.

### Test Case 1: Create a Booking
*   **Endpoint**: `POST /api/bookings`
*   **Request Payload**:
    ```json
    {
      "trip": "64bcde1234567890abcdef12",
      "seats": ["4A", "4B"],
      "totalAmount": 1040,
      "passengers": [
        { "seatNumber": "4A", "name": "Darshan" },
        { "seatNumber": "4B", "name": "Rahul" }
      ]
    }
    ```
*   **Response Output**:
    ```json
    {
      "booking": {
        "_id": "64b0f9c2d3e4f5a6b7c8d9e0",
        "bookingId": "BK-8D9E0",
        "user": "64a0f123456789abcdef0123",
        "trip": "64bcde1234567890abcdef12",
        "seats": ["4A", "4B"],
        "totalAmount": 1040,
        "status": "pending",
        "bookingStatus": "pending"
      },
      "razorpayOrder": {
        "id": "order_demo_64b0f9c2d3e4f5a6b7c8d9e0_abcd",
        "amount": 104000,
        "currency": "INR"
      },
      "isDemo": true
    }
    ```

### Test Case 2: Cancel a Booking
*   **Endpoint**: `PUT /api/bookings/64b0f9c2d3e4f5a6b7c8d9e0/cancel`
*   **Request Payload**:
    ```json
    {
      "cancellationReason": "Change of travel plans"
    }
    ```
*   **Response Output**:
    ```json
    {
      "success": true,
      "message": "Booking cancelled. Refund of ₹520.00 (50%) has been submitted for admin approval.",
      "booking": {
        "_id": "64b0f9c2d3e4f5a6b7c8d9e0",
        "status": "cancelled",
        "refundAmount": 520,
        "refundPercentage": 50,
        "cancellationCharges": 520,
        "refundStatus": "pending",
        "cancelledAt": "2026-06-20T10:15:15.000Z"
      }
    }
    ```

---

## 5. Errors Faced & How They Were Solved (VIVA highlight!)

Examiners love to ask: **"What was a hard bug you faced and how did you solve it?"** 
You can explain this recent real bug as a great example of your debugging skills:

### The "Cancel Ticket Blank Screen" Bug
*   **The Problem**: When a user booked a ticket, went to "My Bookings" and clicked "Cancel Ticket" immediately, the browser loaded a completely blank white screen. But if they navigated back to the home page and came back, it worked perfectly!
*   **How We Debugged It**:
    1.  We inspected the React render tree. The blank screen meant a JavaScript runtime crash occurred during rendering, causing React to unmount the entire page.
    2.  We found that in the `CancelTicket` page, we calculate the refund policy dynamically on the frontend. The page was calling `refund.charges.toFixed(2)` to display the cancellation charges in currency format.
    3.  However, the frontend helper `calculateRefundPolicy` returned an object where the key was `charges` but `CancelTicket` was expecting `cancellationCharges`. 
    4.  Because of this typo, `refund.charges` was `undefined`, and calling `undefined.toFixed(2)` crashed the page.
*   **Why did it work the second time?** 
    *   When the bookings list was loaded from the backend database, it had a missing `bookingDate` mapping in our context.
    *   This missing property triggered a fallback path in our refund calculator: `if (!bookingDate) return 50% refund`. 
    *   In that fallback path, it returned a hardcoded `charges` value (which was a number). Thus, on the second try, it didn't call the main policy calculation, bypassed the undefined property, and rendered correctly!
*   **The Solution**:
    1.  We corrected [refundPolicy.js](file:///c:/Users/Darshan/Desktop/Inst/travel%20(1)/travel/src/utils/refundPolicy.js) to return both `charges` and `cancellationCharges`.
    2.  We modified [CancelTicket.jsx](file:///c:/Users/Darshan/Desktop/Inst/travel%20(1)/travel/src/pages/CancelTicket.jsx) to use a safe fallback (`policy.cancellationCharges ?? policy.charges`).
    3.  We fixed the context mapping in [BookingContext.jsx](file:///c:/Users/Darshan/Desktop/Inst/travel%20(1)/travel/src/context/BookingContext.jsx) to map `bookingDate: b.bookingDate || b.createdAt` so calculations are fully accurate on reload.
