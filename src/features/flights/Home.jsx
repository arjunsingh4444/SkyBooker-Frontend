import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search, Users } from 'lucide-react';
import './Flights.css';

const Home = () => {
  const [tripType, setTripType] = useState('one-way');
  const [searchData, setSearchData] = useState({ source: '', destination: '', date: '', passengers: 1 });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchData.source && searchData.destination && searchData.date) {
      navigate(`/flights?source=${searchData.source}&destination=${searchData.destination}&date=${searchData.date}`);
    }
  };

  return (
    <div className="home-container animate-fade-in">
      <div className="hero-background">
        <div className="hero-content">
          <h1 className="hero-title">
            Discover the World<br />
            <span className="text-primary-light">With SkyBooker</span>
          </h1>
          <p className="hero-subtitle">
            Experience seamless bookings, premium service, and<br />
            unbeatable prices on your next journey.
          </p>
        </div>
      </div>
        
      <div className="search-card-container">
        <div className="search-card">
          <form onSubmit={handleSearch} className="search-form-row">
            
            <div className="search-field">
              <label>ORIGIN</label>
              <div className="input-with-icon">
                <MapPin className="input-icon" size={18} />
                <input 
                  type="text" 
                  className="input-field has-icon" 
                  placeholder="City"
                  value={searchData.source}
                  onChange={(e) => setSearchData({...searchData, source: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="search-field">
              <label>DESTINATION</label>
              <div className="input-with-icon">
                <MapPin className="input-icon" size={18} />
                <input 
                  type="text" 
                  className="input-field has-icon" 
                  placeholder="City"
                  value={searchData.destination}
                  onChange={(e) => setSearchData({...searchData, destination: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="search-field">
              <label>DEPARTURE</label>
              <div className="input-with-icon right-icon">
                <input 
                  type="date" 
                  className="input-field" 
                  value={searchData.date}
                  onChange={(e) => setSearchData({...searchData, date: e.target.value})}
                  required
                />
                <Calendar className="input-icon-right" size={18} />
              </div>
            </div>
          </form>

          <div className="search-action-row">
            <button onClick={handleSearch} className="btn btn-primary search-action-btn">
              <Search size={18} />
              Search Flights
            </button>
          </div>
        </div>
      </div>
      <div className="suggestions-section animate-fade-in">
        <div className="section-header">
          <h2>Popular Destinations</h2>
          <p>Hand-picked travel suggestions for your next adventure</p>
        </div>

        <div className="suggestions-grid">
          {/* Row 1 */}
          <div className="suggestion-card glass-panel" onClick={() => navigate('/flights?destination=Goa')}>
            <div className="suggestion-image-container">
              <img src="/images/destinations/goa.png" alt="Goa" />
              <div className="suggestion-badge">Trending</div>
            </div>
            <div className="suggestion-content">
              <div className="suggestion-title-row">
                <h3 className="destination-name">GOA</h3>
                <span className="suggestion-price">From ₹3,499</span>
              </div>
              <p>Experience the perfect blend of serenity and nightlife on India's most beloved beaches.</p>
            </div>
          </div>

          <div className="suggestion-card glass-panel" onClick={() => navigate('/flights?destination=Agra')}>
            <div className="suggestion-image-container">
              <img src="/images/destinations/agra.png" alt="Agra" />
            </div>
            <div className="suggestion-content">
              <div className="suggestion-title-row">
                <h3 className="destination-name">AGRA</h3>
                <span className="suggestion-price">From ₹2,999</span>
              </div>
              <p>Witness the timeless beauty of the Taj Mahal and explore the rich history of the Mughal Empire.</p>
            </div>
          </div>

          <div className="suggestion-card glass-panel" onClick={() => navigate('/flights?destination=Dubai')}>
            <div className="suggestion-image-container">
              <img src="/images/destinations/dubai.png" alt="Dubai" />
              <div className="suggestion-badge">Luxury</div>
            </div>
            <div className="suggestion-content">
              <div className="suggestion-title-row">
                <h3 className="destination-name">DUBAI</h3>
                <span className="suggestion-price">From ₹12,499</span>
              </div>
              <p>From desert safaris to futuristic skyscrapers, discover the pinnacle of modern luxury.</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="suggestion-card glass-panel" onClick={() => navigate('/flights?destination=London')}>
            <div className="suggestion-image-container">
              <img src="/images/destinations/london.png" alt="London" />
              <div className="suggestion-badge">Europe</div>
            </div>
            <div className="suggestion-content">
              <div className="suggestion-title-row">
                <h3 className="destination-name">LONDON</h3>
                <span className="suggestion-price">From ₹45,999</span>
              </div>
              <p>Explore the historic streets of London, from Big Ben to the London Eye and beyond.</p>
            </div>
          </div>

          <div className="suggestion-card glass-panel" onClick={() => navigate('/flights?destination=Delhi')}>
            <div className="suggestion-image-container">
              <img src="/images/destinations/delhi.png" alt="Delhi" />
              <div className="suggestion-badge">Capital</div>
            </div>
            <div className="suggestion-content">
              <div className="suggestion-title-row">
                <h3 className="destination-name">DELHI</h3>
                <span className="suggestion-price">From ₹2,499</span>
              </div>
              <p>Explore the heart of India — from the iconic India Gate to the historic Red Fort and vibrant street food.</p>
            </div>
          </div>

          <div className="suggestion-card glass-panel" onClick={() => navigate('/flights?destination=Singapore')}>
            <div className="suggestion-image-container">
              <img src="/images/destinations/singapore.png" alt="Singapore" />
              <div className="suggestion-badge">Asia</div>
            </div>
            <div className="suggestion-content">
              <div className="suggestion-title-row">
                <h3 className="destination-name">SINGAPORE</h3>
                <span className="suggestion-price">From ₹18,999</span>
              </div>
              <p>Discover the Garden City, where nature meets futuristic architecture and global cuisine.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
