import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import EventCard from './components/EventCard';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import EventDetailModal from './components/EventDetailModal';
import authService from './services/authService';
import { getEvents } from './services/api';
import './App.css';

function App() {
  const [location, setLocation] = useState('Barcelona');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Check if user is authenticated on mount
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const userData = authService.getUser();
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getEvents();
        setEvents(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Failed to load events", err);
        setError("No se pudieron cargar los eventos. Por favor, intenta más tarde.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      let filtered = events.filter(event =>
        event.location && event.location.city === location
      );

      // Apply category filter
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(event =>
          event.category === selectedCategory
        );
      }

      setFilteredEvents(filtered);
    } else {
      setFilteredEvents([]);
    }
  }, [location, events, selectedCategory]);

  const handleLoginSuccess = (response) => {
    console.log('User logged in:', response);
    setUser(response.user || authService.getUser());
  };

  const handleRegisterSuccess = (response) => {
    console.log('User registered:', response);
    // After registration, show login modal
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const switchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const switchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsEventDetailOpen(true);
  };

  return (
    <div className="app">
      <Navbar
        onLoginClick={() => setIsLoginOpen(true)}
        location={location}
        setLocation={setLocation}
        user={user}
        onLogout={handleLogout}
      />

      <main>
        <section className="hero">
          <div className="container hero-content">
            <h1 className="hero-title">
              Discover the best events in <span className="highlight">{location}</span>
            </h1>
            <p className="hero-subtitle">
              Experience the vibe. Live the moment. njoy.
            </p>
          </div>
          <div className="hero-glow"></div>
        </section>

        <section className="events-section container">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <div className="filter-tags">
              <span
                className={`tag ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('All')}
              >
                All
              </span>
              <span
                className={`tag ${selectedCategory === 'Music' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Music')}
              >
                Music
              </span>
              <span
                className={`tag ${selectedCategory === 'Art' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Art')}
              >
                Art
              </span>
              <span
                className={`tag ${selectedCategory === 'Tech' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Tech')}
              >
                Tech
              </span>
              <span
                className={`tag ${selectedCategory === 'Food' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Food')}
              >
                Food
              </span>
            </div>
          </div>

          <div className="events-grid">
            {loading ? (
              <div className="loading-state">
                <i className="fa-solid fa-spinner fa-spin"></i> Loading events...
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
              </div>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventCard key={event.id} event={event} onClick={() => handleEventClick(event)} />
              ))
            ) : (
              <div className="no-events">
                <p>No events found in {location} at the moment.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onShowRegister={switchToRegister}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
        onShowLogin={switchToLogin}
      />

      <EventDetailModal
        event={selectedEvent}
        isOpen={isEventDetailOpen}
        onClose={() => setIsEventDetailOpen(false)}
      />

      <footer className="footer">
        <div className="container">
          <p>&copy; 2023 njoy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
