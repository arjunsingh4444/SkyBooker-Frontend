import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { flightClient } from '../../services/api';
import { Plane, Clock, IndianRupee, MapPin, Calendar, Search, AlertCircle, ArrowRight } from 'lucide-react';
import './Flights.css';

const FlightResults = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const source = searchParams.get('source') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';

  // Local search form state (initialized from URL params)
  const [searchForm, setSearchForm] = useState({
    source: source,
    destination: destination,
    date: date,
  });

  // Sync form when URL params change (e.g. from destination card click)
  useEffect(() => {
    setSearchForm({
      source: searchParams.get('source') || '',
      destination: searchParams.get('destination') || '',
      date: searchParams.get('date') || '',
    });
  }, [searchParams]);

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      try {
        let res;
        if (source || destination || date) {
          res = await flightClient.get(`/Flight/search`, {
            params: {
              ...(source && { source }),
              ...(destination && { destination }),
              ...(date && { date }),
            }
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

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchForm.source) params.set('source', searchForm.source);
    if (searchForm.destination) params.set('destination', searchForm.destination);
    if (searchForm.date) params.set('date', searchForm.date);
    setSearchParams(params);
  };

  // Build a friendly subtitle
  const getSubtitle = () => {
    if (source && destination && date) {
      return `${source} → ${destination} on ${new Date(date).toLocaleDateString()}`;
    }
    if (source && destination) return `${source} → ${destination}`;
    if (destination) return `Flights to ${destination}`;
    if (source) return `Flights from ${source}`;
    return 'All Available Flights';
  };

  return (
    <div className="results-container animate-fade-in">
      {/* Inline Search Bar */}
      <div className="results-search-bar glass-panel">
        <form onSubmit={handleSearch} className="results-search-form">
          <div className="results-search-field">
            <MapPin size={16} className="results-search-icon" />
            <input
              type="text"
              placeholder="Origin"
              className="input-field"
              value={searchForm.source}
              onChange={e => setSearchForm({ ...searchForm, source: e.target.value })}
            />
          </div>
          <div className="results-search-field">
            <MapPin size={16} className="results-search-icon" />
            <input
              type="text"
              placeholder="Destination"
              className="input-field"
              value={searchForm.destination}
              onChange={e => setSearchForm({ ...searchForm, destination: e.target.value })}
            />
          </div>
          <div className="results-search-field">
            <Calendar size={16} className="results-search-icon" />
            <input
              type="date"
              className="input-field"
              value={searchForm.date}
              onChange={e => setSearchForm({ ...searchForm, date: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary results-search-btn">
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      <div className="results-header">
        <h2>
          {destination && !source ? (
            <>Flights to <span className="text-primary-light">{destination}</span></>
          ) : 'Search Results'}
        </h2>
        <p className="results-meta">{getSubtitle()} • {flights.length} flight{flights.length !== 1 ? 's' : ''} found</p>
      </div>

      {loading ? (
        <div className="loader">
          <div className="flight-loader-animation">
            <Plane size={28} className="loader-plane" />
          </div>
          Searching for best flights...
        </div>
      ) : flights.length === 0 ? (
        <div className="no-flights-container">
          <AlertCircle size={48} className="no-flights-icon" />
          <h3>No flights found</h3>
          <p>No flights match your search criteria. Try adjusting your origin, destination, or date.</p>
          <button className="btn btn-secondary" onClick={() => { setSearchParams({}); setSearchForm({ source: '', destination: '', date: '' }); }}>
            View All Flights
          </button>
        </div>
      ) : (
        <div className="flight-list">
          {flights.map(flight => (
            <div key={flight.id} className="flight-card glass-panel">
              
              <div className="flight-info-left">
                <div className="airline-badge">
                  <Plane size={16} /> {flight.airlineName || 'SkyBooker Air'}
                </div>
                <div className="flight-number-tag">{flight.flightNumber}</div>
                <div className="flight-times">
                  <div className="time-block">
                    <h4>{new Date(flight.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h4>
                    <span>{flight.source}</span>
                  </div>
                  <div className="time-duration">
                    <div className="duration-line">
                      <ArrowRight size={14} />
                    </div>
                    <span>Non-stop</span>
                  </div>
                  <div className="time-block">
                    <h4>{new Date(flight.arrivalTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h4>
                    <span>{flight.destination}</span>
                  </div>
                </div>
                <div className="flight-date-tag">
                  <Calendar size={13} />
                  {new Date(flight.departureTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>

              <div className="flight-info-right">
                <div className="flight-price">
                  <IndianRupee size={20} />
                  <h3>{flight.price?.toLocaleString()}</h3>
                </div>
                <div className="seats-available">{flight.availableSeats} seat{flight.availableSeats !== 1 ? 's' : ''} left</div>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleSelectFlight(flight.id)}
                  disabled={flight.availableSeats === 0}
                >
                  {flight.availableSeats === 0 ? 'Sold Out' : 'Select Seats'}
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
