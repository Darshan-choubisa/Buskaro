# 🚌 BusKaro - Online Bus Ticketing & Reservation Platform

BusKaro is a modern, responsive, and secure web application designed to streamline bus ticket booking, seat reservation, and cancellation processes. Built using the **MERN (MongoDB, Express, React, Node.js)** stack, the platform incorporates secure user authentication, interactive seat mapping, simulated payment gateway integration, dynamic refund policies, and a fully featured admin dashboard.

---

## 🚀 Key Features

### 👤 User Features
*   **Secure Authentication**: User registration and login utilizing client-side AES password encryption and JSON Web Tokens (JWT) for secure session persistence.
*   **Dynamic Bus Search**: Filter and search buses based on origin, destination, and departure date.
*   **Interactive Seat Selection**: Choose seats in real-time from a visual layout that automatically updates booked/reserved seats.
*   **Razorpay Payment Gateway & Sandbox**: Complete transactions securely using a real Razorpay checkout or simulate success/failure in Sandbox developer mode.
*   **My Bookings**: View upcoming and cancelled journeys, and check refund statuses.
*   **Ticket & Receipt PDF Downloads**: Automatically generate and download PDF copies of confirmed tickets and cancellation receipts.
*   **Flexible Ticket Cancellation**: Cancel tickets dynamically with refunds calculated using calendar rules (100% or 50% refund).

### 👑 Admin Features
*   **Superadmin Dashboard**: Oversee bookings, manage system users, and register new buses/operators.
*   **Refund Approval System**: Review, approve, reject, or process user refund requests.
*   **User Management**: Block/unblock users and manage operators.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend** | React (Vite) | High-performance user interface & single-page application framework. |
| **Styling & Animation** | Tailwind CSS & Framer Motion | Modern, sleek styling with smooth transitions and micro-animations. |
| **Routing** | React Router DOM | Decoupled client-side page routing. |
| **State Management** | Context API | Global states for user session and booking history. |
| **Backend API** | Node.js / Express | Fast, asynchronous REST API architecture. |
| **Database** | MongoDB / Mongoose | Scalable NoSQL storage with object modeling schemas. |
| **Security & Encryption** | CryptoJS & JWT | Pre-transmission payload encryption and secure API authentication. |
| **Payment Integration** | Razorpay SDK | Payment gateway checkout and signature verification. |

---

## 📁 Project Structure

```bash
BusKaro/
├── backend/                  # Node.js + Express API Backend
│   ├── controllers/          # Business logic controllers (auth, booking, admin)
│   ├── models/               # MongoDB models (User, Booking, Trip, Refund)
│   ├── routes/               # API endpoint routing
│   ├── utils/                # Helper files (refund calculator)
│   ├── tests/                # Node.js backend unit tests
│   └── server.js             # Express application entrypoint
│
└── src/                      # React Frontend Source
    ├── components/           # Reusable components (Navbar, Footer, Sidebar)
    ├── context/              # Booking and Authentication state providers
    ├── pages/                # Page components (Home, SeatSelection, MyBookings, Admin)
    ├── utils/                # Frontend helpers (API client, PDF generators)
    └── main.jsx              # React app entry point
```

---

## ⚙️ Installation & Local Setup

Follow these steps to run BusKaro on your local machine:

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16+)
*   [MongoDB](https://www.mongodb.com/) (Local Community Server or Atlas Cluster)

### 2. Clone the Repository
```bash
git clone https://github.com/Darshan-choubisa/Buskaro.git
cd Buskaro
```

### 3. Setup Backend
1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend` folder and add:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_jwt_key
   RAZORPAY_KEY_ID=rzp_test_placeholder_key        # Replace with real keys if available
   RAZORPAY_KEY_SECRET=rzp_test_placeholder_secret
   ```
3. Start the backend development server:
   ```bash
   npm run dev
   ```

### 4. Setup Frontend
1. Open a new terminal window, navigate to the frontend root, and install dependencies:
   ```bash
   cd travel
   npm install
   ```
2. Run the frontend development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:5173` to view the app!

---

## 🧪 Unit Tests

To run the automated Node.js backend tests:
```bash
cd backend
npm test
```
The tests check the refund policy correctness, search algorithms, database connections, and auth roles.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
