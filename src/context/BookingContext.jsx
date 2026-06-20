import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * BookingContext — User-Scoped Booking Storage
 *
 * ROOT CAUSE OF THE BUG (Fixed here):
 * Previously all bookings were stored under the single key 'buskaro_bookings'
 * in localStorage, with no connection to which user was logged in.
 * When User A logged out and User B logged in, User B would read User A's
 * bookings because the key was never scoped to a user identity and was
 * never cleared on logout.
 *
 * The Fix:
 *  1. Read the logged-in user's ID from localStorage on every state initialisation.
 *  2. Store bookings under a user-scoped key: `buskaro_bookings_<userId>`.
 *     Each user's bookings are isolated in their own localStorage slot.
 *  3. Listen for login/logout events via a custom 'buskaro-auth-change' event
 *     so the context re-initialises instantly when the active user changes —
 *     without needing a full page reload.
 *  4. The logout helper (called from Navbar) dispatches this event AND clears
 *     the in-memory state, so the UI empties immediately.
 */

const BookingContext = createContext();

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Returns the user-scoped localStorage key, or null if no user is logged in. */
function getStorageKey() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    const uid = user?._id || user?.id;
    return uid ? `buskaro_bookings_${uid}` : null;
  } catch {
    return null;
  }
}

/** Reads bookings for the currently logged-in user from localStorage. */
function loadBookingsFromStorage() {
  const key = getStorageKey();
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Saves bookings for the currently logged-in user to localStorage. */
function saveBookingsToStorage(bookings) {
  const key = getStorageKey();
  if (!key) return; // Not logged in — don't persist anything
  try {
    localStorage.setItem(key, JSON.stringify(bookings));
  } catch {
    // Storage quota exceeded — fail silently
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(() => loadBookingsFromStorage());

  /** Fetch bookings from MongoDB and sync context */
  const fetchBookings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/bookings/my');
      if (Array.isArray(res.data)) {
        const mappedBookings = res.data.map((b) => {
          // Generate a deterministic visual ID from MongoDB ObjectId
          const visualId = `BK-${b._id.toString().slice(-5).toUpperCase()}`;
          return {
            id: b.bookingId || visualId,
            dbBookingId: b._id,
            from: b.trip?.from || '—',
            to: b.trip?.to || '—',
            date: b.trip?.date
              ? new Date(b.trip.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—',
            rawDate: b.trip?.date,
            time: b.trip?.departureTime || '10:15 AM',
            seat: b.seats?.join(', ') || '—',
            busType: b.trip?.busName || b.trip?.operator || '—',
            operator: b.trip?.operator || '—',
            busClass: b.trip?.busClass || (b.trip?.busName?.includes('AC') ? 'AC' : 'Non-AC'),
            price: `₹${b.totalAmount}`,
            rawPrice: b.totalAmount,
            bookingDate: b.bookingDate || b.createdAt,
            image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400",
            status: b.status === 'confirmed' ? 'Upcoming' : b.status === 'cancelled' ? 'Cancelled' : b.status,
            passengers: b.passengers || [],
            refundAmount: b.refundAmount,
            refundPercentage: b.refundPercentage,
            cancellationCharges: b.cancellationCharges,
            cancelledAt: b.cancelledAt,
            cancellationReason: b.cancellationReason,
            refundStatus: b.refundStatus || 'none',
            refundId: b.refundId,
          };
        });
        setBookings(mappedBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings from server:', error);
    }
  }, []);

  // Fetch bookings on initial mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Persist to user-scoped localStorage whenever the list changes
  useEffect(() => {
    saveBookingsToStorage(bookings);
  }, [bookings]);

  /**
   * Re-load bookings whenever the authenticated user changes.
   * Navbar dispatches the 'buskaro-auth-change' custom event on both
   * login and logout so this effect fires immediately.
   */
  const handleAuthChange = useCallback(() => {
    const local = loadBookingsFromStorage();
    if (local.length > 0) {
      setBookings(local);
    } else {
      setBookings([]);
    }
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    window.addEventListener('buskaro-auth-change', handleAuthChange);
    return () => window.removeEventListener('buskaro-auth-change', handleAuthChange);
  }, [handleAuthChange]);

  // ── Public API ────────────────────────────────────────────────────────────

  /** Add a new booking for the current user. */
  const addBooking = (booking) => {
    const visualId = booking.dbBookingId
      ? `BK-${booking.dbBookingId.toString().slice(-5).toUpperCase()}`
      : `BK-${Math.floor(10000 + Math.random() * 90000)}`;
    const newBooking = {
      ...booking,
      id: visualId,
      status: 'Upcoming',
    };
    setBookings((prev) => [newBooking, ...prev]);
  };

  /**
   * Clear bookings from both state AND the user-scoped localStorage slot.
   * Called on explicit "Clear History" or on logout.
   */
  const clearBookings = () => {
    const key = getStorageKey();
    if (key) localStorage.removeItem(key);
    setBookings([]);
  };

  /** Update a booking record after cancellation. */
  const cancelBookingInContext = (
    id,
    refundAmount,
    refundPercentage,
    cancellationCharges = 0,
    cancelledAt = new Date().toISOString(),
    cancellationReason = '',
    refundStatus = 'pending',
    refundId = null
  ) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id
          ? {
              ...booking,
              status: 'Cancelled',
              refundAmount,
              refundPercentage,
              cancellationCharges,
              cancelledAt,
              cancellationReason,
              refundStatus,
              refundId,
            }
          : booking
      )
    );
  };

  return (
    <BookingContext.Provider
      value={{ bookings, addBooking, clearBookings, cancelBookingInContext }}
    >
      {children}
    </BookingContext.Provider>
  );
}

// ─── Custom hook ──────────────────────────────────────────────────────────────

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
}
