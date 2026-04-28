import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { flightClient } from '../../services/api';
import { Plane, Clock, IndianRupee } from 'lucide-react';
import './Flights.css';

const FlightResults = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const source = queryParams.get('source');
  const destination = queryParams.get('destination');
  const date = queryParams.get('date');

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        let res;
        if (source || destination || date) {
          res = await flightClient.get(`/Flight/search`, {
            params: { source, destination, date }
          });
        } else {
          res = await flightClient.get(`/Flight`);
        }
        
        if (res.data.success) {
          setFlights(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching flights', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [source, destination, date]);

  const handleSelectFlight = (flightId) => {
    navigate(`/seats/${flightId}`);
  };

  return (
    <div className="results-container animate-fade-in">
      <h2>Search Results</h2>
      <p className="results-meta">
        {(source && destination && date) ? `${source} to ${destination} on ${new Date(date).toLocaleDateString()}` : 'All Available Flights'}
      </p>

      {loading ? (
        <div className="loader">Searching for best flights...</div>
      ) : flights.length === 0 ? (
        <div className="alert alert-error">No flights found matching your search.</div>
      ) : (
        <div className="flight-list">
          {flights.map(flight => (
            <div key={flight.id} className="flight-card glass-panel">
              
              <div className="flight-info-left">
                <div className="airline-badge">
                  <Plane size={16} /> SkyBooker Air
                </div>
                <div className="flight-times">
                  <div className="time-block">
                    <h4>{new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h4>
                    <span>{flight.source}</span>
                  </div>
                  <div className="time-duration">
                    <Clock size={14} />
                    <span>Non-stop</span>
                  </div>
                  <div className="time-block">
                    <h4>{new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h4>
                    <span>{flight.destination}</span>
                  </div>
                </div>
              </div>

              <div className="flight-info-right">
                <div className="flight-price">
                  <IndianRupee size={20} />
                  <h3>{flight.price}</h3>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleSelectFlight(flight.id)}
                >
                  Select Seats
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlightResults;
