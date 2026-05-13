import React, { useState, useEffect } from 'react';
import { authClient, bookingClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, ShieldOff, Search, Calendar, Phone, Mail, FileText, Edit3, XCircle, Save, X } from 'lucide-react';
import './Admin.css';

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // User Bookings Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editForm, setEditForm] = useState({ passengerName: '', seatNumber: '', status: '' });

  useEffect(() => {
    if (user && user.role !== 'Admin') {
      navigate('/');
    } else {
      fetchAllUsers();
    }
  }, [user, navigate]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const res = await authClient.get('/Auth/users');
      setUsers(res.data.data || []);
      setFilteredUsers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (!query) {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(u => 
        u.fullName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.phone?.toLowerCase().includes(query)
      ));
    }
  };

  const handleViewBookings = async (targetUser) => {
    setSelectedUser(targetUser);
    setIsBookingsLoading(true);
    try {
      const res = await bookingClient.get('/Booking/all');
      const allBookings = res.data.data || [];
      const filtered = allBookings.filter(b => b.userId === targetUser.id);
      setUserBookings(filtered);
    } catch (err) {
      console.error('Failed to fetch user bookings', err);
    } finally {
      setIsBookingsLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm('Are you sure you want to forcefully cancel this booking?')) {
      try {
        await bookingClient.post(`/Booking/${id}/cancel`);
        alert('Booking cancelled successfully.');
        // Refresh bookings for current user
        if (selectedUser) handleViewBookings(selectedUser);
      } catch (err) {
        alert('Failed to cancel booking.');
      }
    }
  };

  const startEditBooking = (booking) => {
    setEditingBookingId(booking.id);
    setEditForm({
      passengerName: booking.passengerName || '',
      seatNumber: booking.seatNumber || '',
      status: booking.status || 'Confirmed'
    });
  };

  const saveEditBooking = async () => {
    try {
      await bookingClient.put(`/Booking/${editingBookingId}`, editForm);
      alert('Booking updated successfully.');
      setEditingBookingId(null);
      if (selectedUser) handleViewBookings(selectedUser);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking.');
    }
  };

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header">
        <h1 className="admin-title">User Management</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/admin')} className="btn btn-secondary">Flights</button>
          <button onClick={() => navigate('/admin/bookings')} className="btn btn-secondary">Bookings</button>
          <button onClick={() => navigate('/admin/seats')} className="btn btn-secondary">Seats</button>
          <button onClick={() => navigate('/admin/notifications')} className="btn btn-secondary">Notifications</button>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '400px' }}>
          <Search size={20} color="#64748b" />
          <input 
            type="text" 
            className="input-field" 
            placeholder="Search users by name, email, or phone..." 
            value={searchQuery}
            onChange={handleSearch}
            style={{ margin: 0 }}
          />
        </div>
        <div style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold' }}>
          Total Users: {users.length}
        </div>
      </div>

      {loading ? (
        <div className="loader">Loading users...</div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Member Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569' }}>
                        {(u.fullName || 'U')[0].toUpperCase()}
                      </div>
                      <strong>{u.fullName || 'Unknown User'}</strong>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <Mail size={14} color="#64748b" /> {u.email}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <Phone size={14} color="#64748b" /> {u.phone || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${u.role?.toLowerCase() === 'admin' ? 'confirmed' : 'pending'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      {u.role?.toLowerCase() === 'admin' ? <Shield size={14} /> : <Users size={14} />}
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', color: '#475569' }}>
                      <Calendar size={14} />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      onClick={() => handleViewBookings(u)}
                    >
                      <FileText size={16} /> View Bookings
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <ShieldOff size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: '#64748b', fontSize: '1.1rem', margin: 0 }}>No users found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Bookings for {selectedUser.fullName}</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#64748b" />
              </button>
            </div>

            {isBookingsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading bookings...</div>
            ) : userBookings.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>This user has no bookings.</div>
            ) : (
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {userBookings.map(b => (
                  <div key={b.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem', background: '#f8fafc' }}>
                    
                    {editingBookingId === b.id ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group" style={{ margin: 0 }}>
                          <label>Passenger Name</label>
                          <input className="input-field" value={editForm.passengerName} onChange={e => setEditForm({...editForm, passengerName: e.target.value})} />
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                          <label>Seat Number</label>
                          <input className="input-field" value={editForm.seatNumber} onChange={e => setEditForm({...editForm, seatNumber: e.target.value})} />
                        </div>
                        <div className="input-group" style={{ margin: 0 }}>
                          <label>Status</label>
                          <select className="input-field" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})}>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                          <button className="btn btn-primary" onClick={saveEditBooking} style={{ flex: 1 }}><Save size={16} /> Save</button>
                          <button className="btn btn-secondary" onClick={() => setEditingBookingId(null)} style={{ flex: 1 }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                          <div>
                            <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>PNR: {b.pnr}</strong>
                            <span className={`status-badge ${b.status?.toLowerCase() || 'confirmed'}`} style={{ marginLeft: '1rem' }}>{b.status || 'Confirmed'}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-icon" title="Edit Booking" onClick={() => startEditBooking(b)} style={{ color: '#f59e0b' }}>
                              <Edit3 size={18} />
                            </button>
                            {b.status !== 'Cancelled' && (
                              <button className="btn-icon delete" title="Cancel Booking" onClick={() => handleCancelBooking(b.id)}>
                                <XCircle size={18} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.9rem', color: '#475569' }}>
                          <div>
                            <strong>Passenger:</strong> <br/>{b.passengerName}
                          </div>
                          <div>
                            <strong>Flight ID:</strong> <br/>{b.flightId}
                          </div>
                          <div>
                            <strong>Seat:</strong> <br/>{b.seatNumber}
                          </div>
                          <div>
                            <strong>Amount:</strong> <br/>₹{b.totalAmount}
                          </div>
                          <div>
                            <strong>Date:</strong> <br/>{new Date(b.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
