import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { seatClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Seats.css';

const SeatSelection = () => {
  const { flightId } = useParams();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSeats();
  }, [flightId, availableOnly]);

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const endpoint = availableOnly 
        ? `/Seat/flight/${flightId}/available` 
        : `/Seat/flight/${flightId}`;
      const res = await seatClient.get(endpoint);
      if (res.data.success) {
        setSeats(res.data.data);
      }
    } catch (err) {
      setError('Failed to load seats map');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.status !== 'Available') return;
    setSelectedSeat(seat);
  };

  const handleLockSeat = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedSeat) return;

    try {
      const res = await seatClient.post('/Seat/lock', {
        flightId: parseInt(flightId),
        seatNumber: selectedSeat.seatNumber,
        userId: user.id
      });
      
      if (res.data.success) {
        navigate('/checkout', { state: { flightId, seat: selectedSeat } });
      } else {
        setError(res.data.message || 'Seat could not be locked');
        fetchSeats();
      }
    } catch (err) {
      setError('An error occurred while locking the seat');
    }
  };



  return (
    <div className="seats-container animate-fade-in">
      <div className="seats-header">
        <h2>Select Your Seat</h2>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <p>Flight #{flightId}</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '8px' }}>
            <input 
              type="checkbox" 
              checked={availableOnly} 
              onChange={(e) => setAvailableOnly(e.target.checked)} 
            />
            Show Available Only
          </label>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loader">Loading seat map...</div>
      ) : (
        <div className="seats-layout-wrapper">
          <div className="plane-front">Front</div>
          
          <div className="seats-grid">
            {seats.map(seat => (
              <div 
                key={seat.id} 
                className={`seat-box ${seat.status.toLowerCase()} ${selectedSeat?.id === seat.id ? 'selected' : ''}`}
                onClick={() => handleSeatClick(seat)}
                title={`Seat ${seat.seatNumber} - ₹${seat.price}`}
              >
                {seat.seatNumber}
              </div>
            ))}
          </div>

          <div className="plane-back">Back</div>
        </div>
      )}

      {selectedSeat && (
        <div className="seat-summary glass-panel">
          <div className="summary-info">
            <h3>Selected: {selectedSeat.seatNumber}</h3>
            <p className="seat-class">{selectedSeat.seatClass}</p>
          </div>
          <div className="summary-price">
            <h3>₹{selectedSeat.price}</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleLockSeat}>
              Lock & Proceed to Checkout
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
