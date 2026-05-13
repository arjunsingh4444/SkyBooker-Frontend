import React, { useState, useEffect } from 'react';
import { flightClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Edit2, Trash2, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const FlightManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [formData, setFormData] = useState({
    flightNumber: '', airlineName: '', source: '', destination: '', 
    departureTime: '', arrivalTime: '', price: '', totalSeats: ''
  });

  useEffect(() => {
    // Basic protection (App routing handles most, but good to be safe)
    if (user && user.role !== 'Admin') {
      navigate('/');
    } else {
      fetchFlights();
    }
  }, [user, navigate]);

  const fetchFlights = async () => {
    try {
      const res = await flightClient.get('/Flight');
      setFlights(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch flights', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingFlight(null);
    setFormData({ flightNumber: '', airlineName: '', source: '', destination: '', departureTime: '', arrivalTime: '', price: '', totalSeats: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (flight) => {
    setEditingFlight(flight);
    setFormData({
      flightNumber: flight.flightNumber,
      airlineName: flight.airlineName,
      source: flight.source,
      destination: flight.destination,
      departureTime: new Date(flight.departureTime).toISOString().slice(0, 16),
      arrivalTime: new Date(flight.arrivalTime).toISOString().slice(0, 16),
      price: flight.price,
      totalSeats: flight.totalSeats
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this flight?')) {
      try {
        await flightClient.delete(`/Flight/${id}`);
        fetchFlights(); // Refresh list
      } catch (err) {
        console.error('Failed to delete flight', err);
        alert('Failed to delete flight. Ensure you have admin privileges.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        flightNumber: formData.flightNumber,
        airlineName: formData.airlineName,
        source: formData.source,
        destination: formData.destination,
        departureTime: new Date(formData.departureTime).toISOString(),
        arrivalTime: new Date(formData.arrivalTime).toISOString(),
        price: parseFloat(formData.price),
        totalSeats: parseInt(formData.totalSeats, 10)
      };

      if (editingFlight) {
        await flightClient.put('/Flight', { id: editingFlight.id, ...payload });
      } else {
        await flightClient.post('/Flight', payload);
      }
      setIsModalOpen(false);
      fetchFlights(); // Refresh list
    } catch (err) {
      console.error('Failed to save flight', err);
      const msg = err.response?.data?.message || err.response?.data?.title || JSON.stringify(err.response?.data?.errors) || 'Check your inputs.';
      alert('Failed to save flight: ' + msg);
    }
  };

  if (loading) return <div className="loading">Loading Admin Panel...</div>;

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header">
        <h1 className="admin-title">Flight Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/admin/bookings')} className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            Bookings
          </button>
          <button onClick={() => navigate('/admin/users')} className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            Users
          </button>
          <button onClick={() => navigate('/admin/seats')} className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            Seats
          </button>
          <button onClick={() => navigate('/admin/notifications')} className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            Notifications
          </button>
          <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Plus size={18} /> Add New Flight
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Flight No.</th>
              <th>Airline</th>
              <th>Route</th>
              <th>Departure</th>
              <th>Price</th>
              <th>Seats</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flights.map(f => (
              <tr key={f.id}>
                <td><strong>{f.flightNumber}</strong></td>
                <td>{f.airlineName}</td>
                <td>{f.source} → {f.destination}</td>
                <td>{new Date(f.departureTime).toLocaleString()}</td>
                <td>₹{f.price}</td>
                <td>{f.availableSeats} / {f.totalSeats}</td>
                <td>
                  <span className={`status-badge ${f.status.toLowerCase()}`}>{f.status}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => openEditModal(f)} className="btn-icon edit" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(f.id)} className="btn-icon delete" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {flights.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No flights found in the system.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingFlight ? 'Edit Flight' : 'Add New Flight'}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#64748b" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Flight Number</label>
                  <input type="text" name="flightNumber" value={formData.flightNumber} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Airline Name</label>
                  <input type="text" name="airlineName" value={formData.airlineName} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Source</label>
                  <input type="text" name="source" value={formData.source} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Destination</label>
                  <input type="text" name="destination" value={formData.destination} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Departure Time</label>
                  <input type="datetime-local" name="departureTime" value={formData.departureTime} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Arrival Time</label>
                  <input type="datetime-local" name="arrivalTime" value={formData.arrivalTime} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" step="0.01" min="1" name="price" value={formData.price} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Total Seats</label>
                  <input type="number" min="1" name="totalSeats" value={formData.totalSeats} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingFlight ? 'Update Flight' : 'Create Flight'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightManagement;
