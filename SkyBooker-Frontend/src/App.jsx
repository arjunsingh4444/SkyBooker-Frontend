import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './features/flights/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Profile from './features/auth/Profile';
import FlightResults from './features/flights/FlightResults';
import SeatSelection from './features/seats/SeatSelection';
import Checkout from './features/booking/Checkout';
import BookingConfirmation from './features/booking/BookingConfirmation';
import FlightManagement from './features/admin/FlightManagement';
import SeatManagement from './features/admin/SeatManagement';
import BookingManagement from './features/admin/BookingManagement';
import MyBookings from './features/booking/MyBookings';
import SavedPassengers from './features/passenger/SavedPassengers';
import NotificationCenter from './features/admin/NotificationCenter';
import UserManagement from './features/admin/UserManagement';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/saved-passengers" element={<SavedPassengers />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/flights" element={<FlightResults />} />
            <Route path="/seats/:flightId" element={<SeatSelection />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/confirmation" element={<BookingConfirmation />} />
            <Route path="/admin" element={<FlightManagement />} />
            <Route path="/admin/seats" element={<SeatManagement />} />
            <Route path="/admin/bookings" element={<BookingManagement />} />
            <Route path="/admin/notifications" element={<NotificationCenter />} />
            <Route path="/admin/users" element={<UserManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
