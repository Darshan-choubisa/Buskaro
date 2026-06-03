# BusKaro - Complete Learning Documentation

Welcome to the BusKaro learning documentation! This repository is designed to teach you how the entire MERN stack application works from end-to-end.

## Project Overview

BusKaro is a full-stack bus booking application. It allows users to search for trips, view bus layouts, select seats, make payments (via Razorpay integration), and view their bookings. It also includes an admin panel to manage buses, bookings, and users.

## Tech Stack

### Frontend
- **React.js (Vite)**: For building the fast, interactive user interface.
- **Tailwind CSS**: For utility-first styling and responsive design.
- **React Router DOM**: For client-side routing (handling page navigation).
- **Context API**: For lightweight state management (e.g., Booking details).
- **Axios**: For making HTTP requests to the backend API.
- **Framer Motion**: For smooth animations.

### Backend
- **Node.js**: The runtime environment executing the server code.
- **Express.js**: The web framework used to build the REST API.
- **Mongoose**: The Object Data Modeling (ODM) library used to interact with MongoDB.
- **JSON Web Tokens (JWT)**: For secure authentication and authorization.
- **Crypto-JS**: Used for cryptographic operations (e.g., Razorpay signature verification).

### Database
- **MongoDB**: A NoSQL database used to store users, trips, and bookings.

## Architecture Summary

This project follows a standard client-server architecture:
1. **The Client (React)** renders the UI and captures user interactions.
2. **The Server (Express)** listens for requests from the client, processes business logic, and interacts with the database.
3. **The Database (MongoDB)** persists all the application data.

They communicate over HTTP using a RESTful API structure, sending JSON payloads back and forth.

## Folder Explanation

- `/src`: Contains all frontend React code.
- `/backend`: Contains all Express server code.
- `/learn`: You are here. This contains all documentation.

## Full Learning Roadmap

Start your journey here by following this learning path:
1. Read `START_HERE.md` to get your bearings.
2. Jump to `/database` to understand the data schema.
3. Move to `/backend` to see how the API exposes that data.
4. Go to `/frontend` to see how the UI consumes the API.
5. Check `/flow` for end-to-end user journeys.
6. Look into `/auth`, `/api`, and `/deployment` for deep-dives into specific topics.
7. Finally, check `/best-practices` to see how to improve the code for production.

Happy learning!
