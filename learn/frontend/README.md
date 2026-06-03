# Frontend Documentation

This section explains how the React frontend of BusKaro is built and operates.

## 1. Folder Structure
The frontend is located in the `/src` folder. Here is how it's organized:
- `/assets`: Static files like images, SVGs, or fonts.
- `/components`: Reusable UI pieces (e.g., `Navbar.jsx`, `Footer.jsx`, `DestinationCard.jsx`).
- `/components/admin`: Admin-specific reusable UI.
- `/context`: Global state management files (e.g., `BookingContext.jsx`).
- `/hooks`: Custom React hooks for shared logic.
- `/pages`: Full-page components connected to routes (e.g., `Home.jsx`, `Login.jsx`).
- `/utils`: Helper functions and constants.
- `App.jsx`: The main routing component.
- `main.jsx`: The entry point that mounts React to the HTML DOM.
- `index.css`: Global styles and Tailwind directives.

## 2. Component Architecture
React applications are built using components. Think of components as custom HTML tags. 
- **Pages** are large components that represent a whole screen.
- **Components** are smaller, reusable pieces used inside pages.
For example, `Home.jsx` (a page) imports and uses `HeroSection.jsx` and `Navbar.jsx` (components). This keeps code modular and maintainable.

## 3. Routing System (React Router DOM)
The routing system is defined in `App.jsx`. It uses `react-router-dom` to map URLs to specific components.
- **Why it's used:** In a Single Page Application (SPA), we don't want the browser to reload the page when navigating. React Router intercepts the URL change and simply swaps out the component being rendered.
- **How it works:** 
  `<Route path="/login" element={<Login />} />` means "If the URL is /login, render the Login component."

## 4. State Management & Hooks

### useState
Used to manage local, component-level state.
- **What it does:** It stores data that can change over time. When the data changes, React automatically re-renders the component to reflect the new data.
- **Where it's used:** Everywhere! For example, tracking what the user types into the search inputs in `Home.jsx`.

### useEffect
Used for "side effects" - things that happen outside the normal component rendering cycle.
- **What it does:** Common uses include fetching data from an API when the component first loads, or manually manipulating the DOM.
- **Where it's used:** In `trips.jsx` to fetch the list of buses when the page opens.

### useContext (BookingContext.jsx)
Used for global state management.
- **Why it's used:** Sometimes you need data in multiple pages. For example, the `SeatSelection.jsx` page captures which seats the user wants. The `Payment.jsx` page needs that exact same data to process the payment. Passing this data down through props (prop drilling) is messy.
- **How it works:** `BookingContext` acts like a global cloud variable. `SeatSelection` saves data to the cloud, and `Payment` pulls it from the cloud.

## 5. API Calling Logic (Axios)
The frontend communicates with the backend using the `axios` library.
- **How it works:** When a user clicks "Search", a function calls `axios.get('http://localhost:5000/api/trips...')`. Axios sends an HTTP request to the Express server, waits for the JSON response, and then updates the React state with the returned data.
- **Why Axios over fetch?** Axios automatically transforms JSON data, has better error handling, and makes it easy to set default headers (like adding an Authorization token to every request).

## 6. Authentication & Protected Routes
- **Login Flow:** When a user logs in, the backend sends back a JWT (JSON Web Token).
- **Storage:** The frontend saves this token in `localStorage`.
- **Protected Routes:** Certain pages (like `/my-bookings` or `/admin`) should only be visible to logged-in users. You would typically use a wrapper component that checks if the token exists in `localStorage` before rendering the page. If it doesn't exist, it redirects the user to `/login`.

## 7. Styling (Tailwind CSS)
Tailwind CSS is a utility-first CSS framework. Instead of writing custom CSS classes in separate files, you apply utility classes directly to your JSX.
- **Why it's used:** It speeds up development drastically and ensures a consistent design system.
- **How it works:** A class like `bg-blue-500` translates to `background-color: #3b82f6;` behind the scenes.

## 8. Important Files Breakdown

### `src/App.jsx`
- **Purpose:** The traffic controller of the app.
- **What breaks if removed:** The entire app. Nothing will render.

### `src/pages/SeatSelection.jsx`
- **Purpose:** Displays the bus layout and allows the user to pick seats.
- **Flow:** 
  1. Reads the `tripId` from the URL or state.
  2. Fetches the specific trip details from the API.
  3. Displays a grid of seats.
  4. When a user clicks a seat, toggles its state (selected/unselected).
  5. On "Proceed", saves the selected seats to `BookingContext` and navigates to `/payment`.

### `src/pages/Payment.jsx`
- **Purpose:** Handles the final checkout step.
- **Flow:**
  1. Pulls the selected seats and trip info from `BookingContext`.
  2. When the user clicks "Pay", initializes the Razorpay SDK.
  3. If payment succeeds, calls the backend API to create a new `Booking` record.
  4. Redirects to a success page or `/my-bookings`.
