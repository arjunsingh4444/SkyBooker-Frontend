import React, { useState, useEffect } from 'react';
import { notificationClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Send } from 'lucide-react';
import './Admin.css';

const NotificationCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [formData, setFormData] = useState({
    recipient: '',
    subject: '',
    message: '',
    type: 'Email' // Email or SMS
  });

  useEffect(() => {
    if (user && user.role !== 'Admin') {
      navigate('/');
    } else {
      fetchHistory();
    }
  }, [user, navigate]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await notificationClient.get('/Notification/history');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await notificationClient.post('/Notification/send', formData);
      alert('Notification sent successfully!');
      setFormData({ recipient: '', subject: '', message: '', type: 'Email' });
      fetchHistory();
    } catch (err) {
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header">
        <h1 className="admin-title">Notification Center</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/admin')} className="btn btn-secondary">Flights</button>
          <button onClick={() => navigate('/admin/bookings')} className="btn btn-secondary">Bookings</button>
          <button onClick={() => navigate('/admin/seats')} className="btn btn-secondary">Seats</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Send Notification Form */}
        <div className="glass-panel" style={{ padding: '1.5rem', alignSelf: 'start' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
            <Send size={20} color="#0ea5e9" /> Manual Alert Trigger
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Push an alert directly to a user's in-app inbox.</p>
          
          <form onSubmit={handleSend}>
            <div className="form-group">
              <label>Recipient Email</label>
              <input type="email" name="recipient" value={formData.recipient} onChange={handleInputChange} required />
            </div>
            
            <div className="form-group">
              <label>Subject</label>
              <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} required />
            </div>
            
            <div className="form-group">
              <label>Message Type</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="Push">Push Notification</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Message Body</label>
              <textarea name="message" value={formData.message} onChange={handleInputChange} required rows="4" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary w-full" disabled={sending}>
              {sending ? 'Sending...' : 'Send Alert'}
            </button>
          </form>
        </div>

        {/* Global History Table */}
        <div className="table-container" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={20} color="#94a3b8" /> Global History (Last 50)
            </h3>
            <button className="btn btn-secondary" onClick={fetchHistory} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Refresh</button>
          </div>
          
          {loading ? (
             <div className="loader" style={{ padding: '2rem' }}>Loading history...</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Recipient</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={n.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(n.sentAt).toLocaleString()}</td>
                    <td>{n.recipient}</td>
                    <td><span className="status-badge" style={{ background: '#f1f5f9', color: '#475569' }}>{n.type}</span></td>
                    <td><strong>{n.subject}</strong></td>
                    <td><span className="status-badge confirmed">{n.status}</span></td>
                  </tr>
                ))}
                {notifications.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>No notifications sent yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
