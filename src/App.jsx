import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Trips from "./pages/trips";
import SeatSelection from "./pages/SeatSelection";
import Payment from "./pages/Payment";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyBookings from "./pages/MyBookings";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/trips" element={<Trips />} />
      <Route path="/select-seat" element={<SeatSelection />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      </Routes>
    </>
  );
}

export default App;
