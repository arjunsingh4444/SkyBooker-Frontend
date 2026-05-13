import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Hash, User, MapPin } from 'lucide-react';
import './Booking.css';

const BookingConfirmation = () => {
  const location = useLocation();
  const { booking } = location.state || {};

  if (!booking) {
    return <div className="alert alert-error">No booking data found.</div>;
  }

  return (
    <div className="confirmation-container animate-fade-in">
      <div className="success-header">
        <CheckCircle size={64} className="success-icon" />
        <h2>Booking Confirmed!</h2>
        <p>Your e-ticket has been sent to your email.</p>
      </div>

      <div className="ticket-card glass-panel">
        <div className="ticket-header">
          <h3>SkyBooker Boarding Pass</h3>
          <div className="pnr-badge">
            PNR: {booking.pnr}
          </div>
        </div>

        <div className="ticket-body">
          <div className="ticket-row">
            <div className="ticket-item">
              <span className="label"><User size={14} /> Passenger</span>
              <span className="value">{booking.passengerName}</span>
            </div>
            <div className="ticket-item text-right">
              <span className="label"><Hash size={14} /> Booking ID</span>
              <span className="value">{booking.id}</span>
            </div>
          </div>

          <div className="ticket-row">
            <div className="ticket-item">
              <span className="label"><MapPin size={14} /> Flight ID</span>
              <span className="value">{booking.flightId}</span>
            </div>
            <div className="ticket-item text-right">
              <span className="label">Seat</span>
              <span className="value text-primary">{booking.seatNumber}</span>
            </div>
          </div>

          <div className="ticket-row">
            <div className="ticket-item">
              <span className="label">Amount Paid</span>
              <span className="value">₹{booking.totalAmount}</span>
            </div>
            <div className="ticket-item text-right">
              <span className="label">Status</span>
              <span className="status-badge">{booking.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <Link to="/" className="btn btn-primary">Book Another Flight</Link>
      </div>
    </div>
  );
};

export default BookingConfirmation;
