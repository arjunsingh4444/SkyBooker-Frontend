import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, User as UserIcon, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationClient } from '../services/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user.email) {
      const fetchNotifs = async () => {
        try {
          const res = await notificationClient.get('/Notification/history');
          if (res.data.data) {
            // Filter global history for this user
            const myNotifs = res.data.data.filter(n => n.recipient === user.email);
            setNotifications(myNotifs);
            setUnreadCount(myNotifs.length);
          }
        } catch (err) {
          console.error('Failed to load notifications');
        }
      };
      fetchNotifs();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="brand-link">
          <div className="logo-icon-wrapper">
            <Plane size={24} className="brand-icon" color="white" />
          </div>
          <span className="brand-text">SkyBooker</span>
        </Link>
      </div>
      
      <div className="navbar-center-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/flights" className="nav-link">Explore Flights</Link>
        {user && <Link to="/my-bookings" className="nav-link">My Bookings</Link>}
        {user && <Link to="/saved-passengers" className="nav-link">Saved Passengers</Link>}
        {user?.role === 'Admin' && <Link to="/admin" className="nav-link">Admin Panel</Link>}
      </div>

      <div className="navbar-menu">
        {user ? (
          <div className="nav-user" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setUnreadCount(0); }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', color: '#334155' }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '350px', zIndex: 1000, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <div style={{ padding: '1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: 0, color: '#0f172a' }}>Your Notifications</h4>
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <p style={{ padding: '2rem 1rem', textAlign: 'center', margin: 0, color: '#64748b' }}>No new notifications.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{n.subject}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(n.sentAt).toLocaleDateString()}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569' }}>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/profile" className="user-greeting" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '8px', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <UserIcon size={18} /> {user.fullName || 'User'}
            </Link>
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <div className="nav-actions">
            <Link to="/login" className="btn btn-outline-primary">
              <UserIcon size={18} /> Login / Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
