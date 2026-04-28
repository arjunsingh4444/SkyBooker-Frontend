import React, { useState, useEffect } from 'react';
import { seatClient, flightClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Grid } from 'lucide-react';
import './Admin.css';

const SeatManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [selectedFlightId, setSelectedFlightId] = useState('');
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generateForm, setGenerateForm] = useState({ totalSeats: 120, economyPrice: 150, seatsPerRow: 6 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customSeatForm, setCustomSeatForm] = useState({ seatNumber: '', seatClass: 'Economy', price: '' });
  const [selectedSeatDetails, setSelectedSeatDetails] = useState(null);

  useEffect(() => {
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
      if (res.data.data && res.data.data.length > 0) {
        setSelectedFlightId(res.data.data[0].id.toString());
        fetchSeats(res.data.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch flights', err);
    }
  };

  const fetchSeats = async (flightId) => {
    setLoading(true);
    try {
      const res = await seatClient.get(`/Seat/flight/${flightId}`);
      setSeats(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch seats', err);
      setSeats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFlightChange = (e) => {
    const newFlightId = e.target.value;
    setSelectedFlightId(newFlightId);
    fetchSeats(newFlightId);
  };

  const handleGenerateSeats = async (e) => {
    e.preventDefault();
    if (!selectedFlightId) return;
    
    try {
      setLoading(true);
      await seatClient.post('/Seat/generate', {
        flightId: parseInt(selectedFlightId, 10),
        totalSeats: parseInt(generateForm.totalSeats, 10),
        economyPrice: parseFloat(generateForm.economyPrice),
        seatsPerRow: parseInt(generateForm.seatsPerRow, 10)
      });
      fetchSeats(selectedFlightId);
    } catch (err) {
      alert('Failed to generate seats. Make sure there are no existing seats for this flight.');
      setLoading(false);
    }
  };

  const fetchSeatDetails = async (id) => {
    try {
      const res = await seatClient.get(`/Seat/${id}`);
      setSelectedSeatDetails(res.data.data);
    } catch (err) {
      alert('Failed to load seat details');
    }
  };

  const handleCustomSeatSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFlightId) return;

    try {
      await seatClient.post('/Seat', {
        flightId: parseInt(selectedFlightId, 10),
        seatNumber: customSeatForm.seatNumber,
        seatClass: customSeatForm.seatClass,
        price: parseFloat(customSeatForm.price)
      });
      setIsModalOpen(false);
      fetchSeats(selectedFlightId);
    } catch (err) {
      alert('Failed to create custom seat.');
    }
  };

  const handleUpdateSeat = async () => {
    try {
      await seatClient.put(`/Seat/${selectedSeatDetails.id}`, {
        seatClass: selectedSeatDetails.seatClass,
        price: selectedSeatDetails.price,
        status: selectedSeatDetails.status
      });
      setSelectedSeatDetails(null);
      fetchSeats(selectedFlightId);
    } catch (err) {
      alert('Failed to update seat.');
    }
  };

  const handleDeleteSeat = async () => {
    if (!window.confirm('Are you sure you want to delete this seat?')) return;
    try {
      await seatClient.delete(`/Seat/${selectedSeatDetails.id}`);
      setSelectedSeatDetails(null);
      fetchSeats(selectedFlightId);
    } catch (err) {
      alert('Failed to delete seat.');
    }
  };

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header">
        <h1 className="admin-title">Seat Layout Management</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/admin')} className="btn btn-secondary">Flights</button>
          <button onClick={() => navigate('/admin/bookings')} className="btn btn-secondary">Bookings</button>
          <button onClick={() => navigate('/admin/notifications')} className="btn btn-secondary">Notifications</button>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label>Select Flight</label>
            <select className="input-field" value={selectedFlightId} onChange={handleFlightChange}>
              {flights.map(f => (
                <option key={f.id} value={f.id}>
                  {f.flightNumber} - {f.source} to {f.destination}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-secondary" onClick={() => fetchSeats(selectedFlightId)} style={{ height: '44px' }}>
            <Search size={18} style={{ marginRight: '0.5rem' }}/> Refresh Map
          </button>
        </div>
      </div>

      {seats.length === 0 && !loading && selectedFlightId && (
        <div className="glass-panel" style={{ marginBottom: '2rem', padding: '2rem', textAlign: 'center' }}>
          <Grid size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }}/>
          <h3>No Seats Generated Yet</h3>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Generate a new seat map for this flight instantly.</p>
          
          <form onSubmit={handleGenerateSeats} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Total Seats</label>
              <input type="number" min="6" value={generateForm.totalSeats} onChange={(e) => setGenerateForm({...generateForm, totalSeats: e.target.value})} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Base Price (₹)</label>
              <input type="number" step="0.01" min="1" value={generateForm.economyPrice} onChange={(e) => setGenerateForm({...generateForm, economyPrice: e.target.value})} required />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Seats / Row</label>
              <input type="number" min="2" max="10" value={generateForm.seatsPerRow} onChange={(e) => setGenerateForm({...generateForm, seatsPerRow: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', height: '44px' }}>
              Generate Layout
            </button>
          </form>
        </div>
      )}

      {loading && <div className="loader">Loading...</div>}

      {seats.length > 0 && !loading && (
        <div className="table-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Seat Inventory ({seats.length} total)</h3>
            <button className="btn btn-secondary" onClick={() => setIsModalOpen(true)} style={{ padding: '0.5rem 1rem' }}>
              <Plus size={16} style={{ marginRight: '0.5rem' }}/> Custom Seat
            </button>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Seat No.</th>
                <th>Class</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {seats.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td><strong>{s.seatNumber}</strong></td>
                  <td>{s.seatClass}</td>
                  <td>₹{s.price}</td>
                  <td><span className={`status-badge ${s.status.toLowerCase()}`}>{s.status}</span></td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => fetchSeatDetails(s.id)}>
                      Inspect (GET /id)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedSeatDetails && (
        <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: '10vh' }} onClick={() => setSelectedSeatDetails(null)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>Seat Details & Edit</h3>
            <div className="form-group">
              <label>ID / Number</label>
              <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '4px' }}>
                {selectedSeatDetails.id} / <strong>{selectedSeatDetails.seatNumber}</strong>
              </div>
            </div>
            
            <div className="form-group">
              <label>Seat Class</label>
              <input type="text" value={selectedSeatDetails.seatClass} onChange={e => setSelectedSeatDetails({...selectedSeatDetails, seatClass: e.target.value})} />
            </div>

            <div className="form-group">
              <label>Price</label>
              <input type="number" step="0.01" value={selectedSeatDetails.price} onChange={e => setSelectedSeatDetails({...selectedSeatDetails, price: parseFloat(e.target.value) || 0})} />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={selectedSeatDetails.status} onChange={e => setSelectedSeatDetails({...selectedSeatDetails, status: e.target.value})} className="input-field">
                <option value="Available">Available</option>
                <option value="Locked">Locked</option>
                <option value="Booked">Booked</option>
              </select>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#64748b' }}><strong>Booked By User ID:</strong> {selectedSeatDetails.bookedByUserId || 'None'}</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedSeatDetails(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleUpdateSeat}>Save</button>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <button className="btn btn-error w-full" onClick={handleDeleteSeat} style={{ background: '#ef4444', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Delete Seat</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '400px' }}>
            <h3>Create Custom Seat</h3>
            <form onSubmit={handleCustomSeatSubmit}>
              <div className="form-group">
                <label>Seat Number (e.g. VIP-1)</label>
                <input type="text" value={customSeatForm.seatNumber} onChange={e => setCustomSeatForm({...customSeatForm, seatNumber: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Class</label>
                <input type="text" value={customSeatForm.seatClass} onChange={e => setCustomSeatForm({...customSeatForm, seatClass: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input type="number" step="0.01" value={customSeatForm.price} onChange={e => setCustomSeatForm({...customSeatForm, price: e.target.value})} required />
              </div>
              <div className="modal-actions mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Seat</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatManagement;
