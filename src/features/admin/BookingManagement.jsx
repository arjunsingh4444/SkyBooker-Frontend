import React, { useState, useEffect } from 'react';
import { bookingClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Search, XCircle, FileText } from 'lucide-react';
import './Admin.css';

const BookingManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPnr, setSearchPnr] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (user && user.role !== 'Admin') {
      navigate('/');
    } else {
      fetchAllBookings();
    }
  }, [user, navigate]);

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingClient.get('/Booking/all');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchPnr.trim()) {
      fetchAllBookings();
      return;
    }
    
    setLoading(true);
    try {
      const res = await bookingClient.get(`/Booking/pnr/${searchPnr}`);
      // The backend returns a single booking object if found
      if (res.data.data) {
        setBookings([res.data.data]);
      } else {
        setBookings([]);
      }
    } catch (err) {
      alert('Booking not found with that PNR');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm('Are you sure you want to forcefully cancel this booking? This action cannot be undone.')) {
      try {
        await bookingClient.post(`/Booking/${id}/cancel`);
        alert('Booking cancelled successfully.');
        fetchAllBookings();
      } catch (err) {
        alert('Failed to cancel booking.');
      }
    }
  };

  const viewDetails = async (id) => {
    try {
      const res = await bookingClient.get(`/Booking/${id}`);
      setSelectedBooking(res.data.data);
    } catch (err) {
      alert('Failed to load booking details');
    }
  };

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header">
        <h1 className="admin-title">Booking Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/admin')} className="btn btn-secondary">Flights</button>
          <button onClick={() => navigate('/admin/seats')} className="btn btn-secondary">Seats</button>
          <button onClick={() => navigate('/admin/notifications')} className="btn btn-secondary">Notifications</button>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label>Search by PNR</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Enter PNR..." 
                value={searchPnr} 
                onChange={(e) => setSearchPnr(e.target.value)}
                style={{ textTransform: 'uppercase' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
                <Search size={18} />
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => { setSearchPnr(''); fetchAllBookings(); }}>
                Clear
              </button>
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="loader">Loading bookings...</div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>PNR</th>
                <th>Passenger</th>
                <th>Flight ID</th>
                <th>Seat</th>
                <th>Total (₹)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td><strong>{b.pnr}</strong></td>
                  <td>{b.passengerName}</td>
                  <td>{b.flightId}</td>
                  <td>{b.seatNumber}</td>
                  <td>₹{b.totalAmount}</td>
                  <td>
                    <span className={`status-badge ${b.status?.toLowerCase() || 'confirmed'}`}>{b.status || 'Confirmed'}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="View Details" onClick={() => viewDetails(b.id)} style={{ color: '#0ea5e9' }}>
                        <FileText size={18} />
                      </button>
                      {b.status !== 'Cancelled' && (
                        <button className="btn-icon delete" title="Cancel Booking" onClick={() => handleCancelBooking(b.id)}>
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>Booking Details ({selectedBooking.pnr})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <p><strong>Passenger Name:</strong><br/>{selectedBooking.passengerName}</p>
                <p><strong>Email:</strong><br/>{selectedBooking.passengerEmail}</p>
                <p><strong>Phone:</strong><br/>{selectedBooking.passengerPhone}</p>
              </div>
              <div>
                <p><strong>Flight ID:</strong><br/>{selectedBooking.flightId}</p>
                <p><strong>Seat Number:</strong><br/>{selectedBooking.seatNumber}</p>
                <p><strong>Total Amount:</strong><br/>₹{selectedBooking.totalAmount}</p>
              </div>
            </div>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
              <p><strong>Status:</strong> {selectedBooking.status}</p>
              <p><strong>Created At:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</p>
            </div>
            <button className="btn btn-primary w-full mt-4" onClick={() => setSelectedBooking(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
