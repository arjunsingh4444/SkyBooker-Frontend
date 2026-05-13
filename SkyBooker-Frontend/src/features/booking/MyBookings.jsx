import React, { useState, useEffect } from 'react';
import { bookingClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Ticket, XCircle } from 'lucide-react';
import '../admin/Admin.css'; // Reusing some table styles

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchMyBookings();
    }
  }, [user, navigate]);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingClient.get('/Booking/my-bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    if (booking.status === 'Confirmed') {
      alert('Sorry, confirmed bookings cannot be cancelled directly. Please contact support.');
      return;
    }

    if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      try {
        const res = await bookingClient.post(`/Booking/${booking.id}/cancel`);
        if (res.data.success) {
          alert('Booking cancelled successfully.');
          fetchMyBookings();
        } else {
          alert(res.data.message || 'Failed to cancel booking.');
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to cancel booking.';
        alert(errorMsg);
      }
    }
  };

  if (loading) return <div className="loader">Loading your bookings...</div>;

  return (
    <div className="admin-container animate-fade-in" style={{ maxWidth: '1000px' }}>
      <div className="admin-header">
        <h1 className="admin-title">My Bookings</h1>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>PNR</th>
              <th>Passenger</th>
              <th>Flight ID</th>
              <th>Seat</th>
              <th>Date Booked</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id}>
                <td><strong>{b.pnr}</strong></td>
                <td>{b.passengerName}</td>
                <td>{b.flightId}</td>
                <td>{b.seatNumber}</td>
                <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${b.status?.toLowerCase() || 'confirmed'}`}>{b.status || 'Confirmed'}</span>
                </td>
                <td>
                  {b.status !== 'Cancelled' && (
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#dc2626' }} onClick={() => handleCancelBooking(b)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>
                  <Ticket size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                  <h3>No Bookings Found</h3>
                  <p>You haven't made any flight bookings yet.</p>
                  <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>Search Flights</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyBookings;

