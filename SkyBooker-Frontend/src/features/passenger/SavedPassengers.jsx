import React, { useState, useEffect } from 'react';
import { passengerClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Edit2, Trash2, Users } from 'lucide-react';
import '../admin/Admin.css'; // Reusing some base styles

const SavedPassengers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '',
    passportNumber: '',
    nationality: ''
  });

  useEffect(() => {
    if (!user) navigate('/login');
    else fetchPassengers();
  }, [user, navigate]);

  const fetchPassengers = async () => {
    setLoading(true);
    try {
      const res = await passengerClient.get('/Passenger');
      setPassengers(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch passengers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ firstName: '', lastName: '', gender: 'Male', dateOfBirth: '', passportNumber: '', nationality: '' });
    setIsModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const res = await passengerClient.get(`/Passenger/${id}`);
      if (res.data.data) {
        const p = res.data.data;
        setFormData({
          firstName: p.firstName,
          lastName: p.lastName,
          gender: p.gender,
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '', // format for input type date
          passportNumber: p.passportNumber || '',
          nationality: p.nationality || ''
        });
        setEditingId(id);
        setIsModalOpen(true);
      }
    } catch (err) {
      alert('Failed to load passenger details');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this saved passenger?')) {
      try {
        await passengerClient.delete(`/Passenger/${id}`);
        fetchPassengers();
      } catch (err) {
        alert('Failed to delete passenger');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await passengerClient.put(`/Passenger/${editingId}`, formData);
      } else {
        await passengerClient.post('/Passenger', formData);
      }
      setIsModalOpen(false);
      fetchPassengers();
    } catch (err) {
      alert('Failed to save passenger details');
    }
  };

  if (loading) return <div className="loader">Loading saved passengers...</div>;

  return (
    <div className="admin-container animate-fade-in" style={{ maxWidth: '1000px' }}>
      <div className="admin-header">
        <h1 className="admin-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={32} color="#0284c7" /> Saved Passengers
        </h1>
        <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <UserPlus size={18} /> Add New Passenger
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {passengers.map(p => (
          <div key={p.id} className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn-icon" onClick={() => openEditModal(p.id)} style={{ color: '#0ea5e9' }}>
                <Edit2 size={16} />
              </button>
              <button className="btn-icon delete" onClick={() => handleDelete(p.id)}>
                <Trash2 size={16} />
              </button>
            </div>
            
            <h3 style={{ marginTop: 0, paddingRight: '3rem' }}>{p.firstName} {p.lastName}</h3>
            <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
              <p><strong>Gender:</strong> {p.gender}</p>
              <p><strong>DOB:</strong> {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Nationality:</strong> {p.nationality}</p>
              <p><strong>Passport:</strong> {p.passportNumber || 'Not provided'}</p>
            </div>
          </div>
        ))}
      </div>

      {passengers.length === 0 && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Users size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
          <h3>No Saved Passengers</h3>
          <p style={{ color: '#64748b' }}>Save your family and friends' details here for faster booking checkout.</p>
          <button onClick={openAddModal} className="btn btn-secondary mt-4">Add First Passenger</button>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '500px' }}>
            <h3>{editingId ? 'Edit Passenger' : 'Add New Passenger'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                </div>
              </div>
              
              <div className="input-group-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label>Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label>Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>Nationality</label>
                <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Passport Number (Optional)</label>
                <input type="text" name="passportNumber" value={formData.passportNumber} onChange={handleInputChange} />
              </div>

              <div className="modal-actions mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Save Passenger'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPassengers;
