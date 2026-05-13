import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Shield, Calendar, Edit3, ArrowLeft, CheckCircle, Plane, Ticket, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authClient, bookingClient, passengerClient } from '../../services/api';
import './Profile.css';

const Profile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    id: 0,
    fullName: '',
    phone: '',
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user) {
      setForm({
        id: user.id,
        fullName: user.fullName || '',
        phone: user.phone || '',
      });
    }
  }, [user, token]);



  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await authClient.put('/Auth/update-profile', form);
      if (res.data.success) {
        setMessage('Profile updated successfully!');
        setEditing(false);
        // Reload page to refresh context
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setMessage(res.data.message || 'Update failed');
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-loading">
        <div className="profile-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  const initials = (user.fullName || 'U')
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="profile-page animate-fade-in">
      {/* Back button */}
      <button className="profile-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={18} /> Back
      </button>

      {/* Hero Section */}
      <div className="profile-hero">
        <div className="profile-hero-bg"></div>
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <span>{initials}</span>
          </div>
          <div className="profile-hero-info">
            <h1>{user.fullName}</h1>
            <span className={`profile-role-badge role-${user.role?.toLowerCase()}`}>
              <Shield size={14} /> {user.role}
            </span>
          </div>
        </div>
      </div>



      {/* Details Card */}
      <div className="profile-details-card">
        <div className="profile-card-header">
          <h2>Profile Details</h2>
          {!editing && (
            <button className="profile-edit-btn" onClick={() => setEditing(true)}>
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message.includes('success') && <CheckCircle size={16} />} {message}
          </div>
        )}

        <div className="profile-fields">
          <div className="profile-field">
            <div className="field-icon"><User size={18} /></div>
            <div className="field-content">
              <label>Full Name</label>
              {editing ? (
                <input
                  className="input-field"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                />
              ) : (
                <p>{user.fullName}</p>
              )}
            </div>
          </div>

          <div className="profile-field">
            <div className="field-icon"><Mail size={18} /></div>
            <div className="field-content">
              <label>Email Address</label>
              <p>{user.email}</p>
            </div>
          </div>

          <div className="profile-field">
            <div className="field-icon"><Phone size={18} /></div>
            <div className="field-content">
              <label>Phone Number</label>
              {editing ? (
                <input
                  className="input-field"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              ) : (
                <p>{user.phone || 'Not provided'}</p>
              )}
            </div>
          </div>

          <div className="profile-field">
            <div className="field-icon"><Shield size={18} /></div>
            <div className="field-content">
              <label>Account Role</label>
              <p>{user.role}</p>
            </div>
          </div>

          <div className="profile-field">
            <div className="field-icon"><Calendar size={18} /></div>
            <div className="field-content">
              <label>Member Since</label>
              <p>{memberSince}</p>
            </div>
          </div>
        </div>

        {editing && (
          <div className="profile-actions">
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="btn btn-secondary" onClick={() => { setEditing(false); setMessage(''); }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
