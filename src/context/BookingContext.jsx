import { createContext, useContext, useState, useEffect } from 'react';

// 1. Create the Context
// Think of this as creating a "cloud" storage space that any component can access.
const BookingContext = createContext();

// 2. Create the Provider Component
// This component wraps around other components to "provide" the data to them.
export function BookingProvider({ children }) {
  // State to hold the user's bookings. 
  // We initialize it by checking if there's existing data in localStorage.
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('buskaro_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  // useEffect watches the 'bookings' state.
  // Whenever bookings change (e.g. user makes a new booking), it saves the new list to localStorage.
  // This is how we achieve data persistence across page refreshes!
  useEffect(() => {
    localStorage.setItem('buskaro_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Helper function to add a new booking
  const addBooking = (booking) => {
    const newBooking = {
      ...booking,
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Upcoming',
    };
    // Update state using the 'spread' operator to keep previous bookings
    setBookings((prev) => [newBooking, ...prev]);
  };

  // Helper function to clear all bookings (useful on logout)
  const clearBookings = () => {
    setBookings([]);
    localStorage.removeItem('buskaro_bookings');
  };

  return (
    // The 'value' prop dictates what data/functions are exposed to the rest of the app.
    <BookingContext.Provider value={{ bookings, addBooking, clearBookings }}>
      {children}
    </BookingContext.Provider>
  );
}

// 3. Create a Custom Hook
// This is a shortcut so components can just call `useBookings()` instead of `useContext(BookingContext)`
export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}
