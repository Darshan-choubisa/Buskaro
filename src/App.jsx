import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Trips from "./pages/trips";
import SeatSelection from "./pages/SeatSelection";
import Payment from "./pages/Payment";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyBookings from "./pages/MyBookings";
import CancelTicket from "./pages/CancelTicket";
import CancellationSuccess from "./pages/CancellationSuccess";
import OperatorDashboard from "./pages/OperatorDashboard";
import ScrollToTop from "./components/ScrollToTop";

// Admin Pages
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBuses from "./pages/admin/AdminBuses";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminRefunds from "./pages/admin/AdminRefunds";
import AdminRefundProcess from "./pages/admin/AdminRefundProcess";

/**
 * App Component - The Root of the Frontend Architecture
 * 
 * This component acts as the "Traffic Controller" for the entire application.
 * It uses React Router (Routes, Route) to determine which page component 
 * should be rendered on the screen based on the current URL in the browser.
 */
function App() {
  return (
    <>
      {/* ScrollToTop ensures that when you navigate to a new page, it scrolls to the very top automatically */}
      <ScrollToTop />
      
      {/* The <Routes> wrapper watches the URL and renders the first matching <Route> */}
      <Routes>
      {/* Public Routes accessible to everyone */}
      <Route path="/" element={<Home />} />
      <Route path="/trips" element={<Trips />} />
      <Route path="/select-seat" element={<SeatSelection />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/cancel-ticket/:bookingId" element={<CancelTicket />} />
      <Route path="/cancellation-success" element={<CancellationSuccess />} />
      <Route path="/operator" element={<OperatorDashboard />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Nested Routing: AdminLayout serves as a wrapper template (with a sidebar) 
          for all child routes like dashboard, buses, etc. */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* 'index' means this is the default route when you go to /admin */}
        <Route index element={<AdminDashboard />} />
        <Route path="buses" element={<AdminBuses />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="refunds" element={<AdminRefunds />} />
        <Route path="refunds/:id/process" element={<AdminRefundProcess />} />
      </Route>
      </Routes>
    </>
  );
}

export default App;
