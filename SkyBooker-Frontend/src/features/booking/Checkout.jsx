import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { passengerClient, bookingClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, CreditCard, Calendar } from 'lucide-react';
import './Booking.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { flightId, seat } = location.state || {};
  const { user } = useAuth();

  const [passenger, setPassenger] = useState({
    firstName: user?.fullName?.split(' ')[0] || '',
    lastName: user?.fullName?.split(' ').slice(1).join(' ') || '',
    gender: 'Male',
    dateOfBirth: '',
    nationality: '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [savedPassengers, setSavedPassengers] = useState([]);
  const [usingSavedPassenger, setUsingSavedPassenger] = useState(false);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await passengerClient.get('/Passenger');
        if (res.data.data) {
          setSavedPassengers(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load saved passengers', err);
      }
    };
    if (user) fetchSaved();
  }, [user]);

  if (!flightId || !seat) {
    return <div className="alert alert-error">Invalid checkout session. Please start over.</div>;
  }

  const handleInputChange = (e) => {
    setPassenger({ ...passenger, [e.target.name]: e.target.value });
    // User is manually editing, so they're no longer using a saved passenger as-is
    setUsingSavedPassenger(false);
  };

  const handleSelectSavedPassenger = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return; // "Select..." option
    const p = savedPassengers.find(x => x.id.toString() === selectedId);
    if (p) {
      setPassenger({
        ...passenger,
        firstName: p.firstName,
        lastName: p.lastName,
        gender: p.gender,
        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
        nationality: p.nationality
      });
      setUsingSavedPassenger(true);
    }
  };

  const baseFare = seat?.price || 0;
  const gst = Math.round(baseFare * 0.18);
  const totalAmount = baseFare + gst;

  const handleCheckout = async (e, forcedStatus = null) => {
    if (e) e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // 1. Save passenger profile only if NOT already a saved passenger
      if (!usingSavedPassenger) {
        // Check if this passenger already exists in saved list (match by name + DOB)
        const alreadyExists = savedPassengers.some(
          p => p.firstName.toLowerCase() === passenger.firstName.toLowerCase()
            && p.lastName.toLowerCase() === passenger.lastName.toLowerCase()
            && p.dateOfBirth && passenger.dateOfBirth
            && p.dateOfBirth.split('T')[0] === passenger.dateOfBirth
        );
        if (!alreadyExists) {
          try {
            await passengerClient.post('/Passenger', passenger);
          } catch (err) {
            console.warn('Could not save passenger to profile, but continuing checkout', err);
          }
        }
      }

      // 2. Create Booking
      const bookingData = {
        flightId: parseInt(flightId),
        seatNumber: seat.seatNumber,
        totalAmount: totalAmount,
        passengerName: `${passenger.firstName} ${passenger.lastName}`,
        passengerEmail: passenger.email || 'guest@example.com',
        passengerPhone: passenger.phone || '0000000000',
        status: forcedStatus || 'Confirmed'
      };

      const bookingRes = await bookingClient.post('/Booking', bookingData);
      
      if (bookingRes.data.success) {
        navigate('/confirmation', { state: { booking: bookingRes.data.data } });
      } else {
        throw new Error(bookingRes.data.message || 'Booking failed');
      }

    } catch (err) {
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-container animate-fade-in">
      <h2>Complete Your Booking</h2>
      <p>Flight #{flightId} • Seat {seat.seatNumber}</p>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="checkout-grid">
        <div className="checkout-form-section glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Passenger Details</h3>
            {savedPassengers.length > 0 && (
              <select className="input-field" style={{ width: 'auto', padding: '0.4rem' }} onChange={handleSelectSavedPassenger} defaultValue="">
                <option value="" disabled>Auto-fill from saved...</option>
                {savedPassengers.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
            )}
          </div>
          <form onSubmit={handleCheckout}>
            <div className="input-group-row">
              <div className="input-group w-full">
                <label>First Name</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={18} />
                  <input type="text" name="firstName" className="input-field has-icon" required value={passenger.firstName} onChange={handleInputChange} />
                </div>
              </div>
              <div className="input-group w-full">
                <label>Last Name</label>
                <input type="text" name="lastName" className="input-field" required value={passenger.lastName} onChange={handleInputChange} />
              </div>
            </div>

            <div className="input-group-row">
              <div className="input-group w-full">
                <label>Email</label>
                <input type="email" name="email" className="input-field" required value={passenger.email} onChange={handleInputChange} />
              </div>
              <div className="input-group w-full">
                <label>Phone Number</label>
                <input type="tel" name="phone" className="input-field" required value={passenger.phone} onChange={handleInputChange} />
              </div>
            </div>

            <div className="input-group-row">
              <div className="input-group w-full">
                <label>Date of Birth</label>
                <div className="input-with-icon">
                  <Calendar className="input-icon" size={18} />
                  <input type="date" name="dateOfBirth" className="input-field has-icon" required value={passenger.dateOfBirth} onChange={handleInputChange} />
                </div>
              </div>
              <div className="input-group w-full">
                <label>Gender</label>
                <select name="gender" className="input-field" value={passenger.gender} onChange={handleInputChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Nationality</label>
              <input type="text" name="nationality" className="input-field" required value={passenger.nationality} onChange={handleInputChange} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={processing}>
                <CreditCard size={18} />
                {processing ? 'Processing...' : `Pay ₹${totalAmount}`}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ flex: 1, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }} 
                disabled={processing}
                onClick={(e) => handleCheckout(e, 'Pending')}
              >
                Book & Pay Later
              </button>
            </div>
          </form>
        </div>

        <div className="checkout-summary-section glass-panel">
          <h3>Fare Summary</h3>
          <div className="summary-row">
            <span>Base Fare ({seat.seatClass})</span>
            <span>₹{baseFare}</span>
          </div>
          <div className="summary-row">
            <span>GST (18%)</span>
            <span>₹{gst}</span>
          </div>
          <hr />
          <div className="summary-row total">
            <span>Total Amount</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
