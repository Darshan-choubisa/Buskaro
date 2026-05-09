import { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(() => {
    const saved = localStorage.getItem('buskaro_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('buskaro_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const addBooking = (booking) => {
    const newBooking = {
      ...booking,
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Upcoming',
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  const clearBookings = () => {
    setBookings([]);
    localStorage.removeItem('buskaro_bookings');
  };

  return (
    <BookingContext.Provider value={{ bookings, addBooking, clearBookings }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}
