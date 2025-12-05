import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import EventCard from './components/EventCard';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import CreateEventModal from './components/CreateEventModal';
import EventDetailModal from './components/EventDetailModal';
import Profile from './pages/Profile';
import CreateEvent from './pages/CreateEvent';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/authService';
import { getEvents } from './services/api';
import './App.css';

function App() {
  const { t } = useTranslation();
  const [location, setLocation] = useState('Barcelona');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Failed to load events", err);

      // Handle authentication errors specifically
      if (err.response?.status === 401) {
        if (authService.isAuthenticated()) {
          // Token expired
          setError(t('common.sessionExpired'));
          authService.logout();
          setUser(null);
        } else {
          // Not logged in - but events should be public now
          setError(t('common.authError'));
        }
      } else {
        setError(t('common.error'));
      }
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleCreateEventSuccess = (newEvent) => {
    console.log('Event created successfully');
    // Refresh events list
    fetchEvents();
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

  const HomePage = () => (
    <main>
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">
            <Trans i18nKey="hero.title" values={{ location }}>
              Discover the best events in <span className="highlight">{{ location }}</span>
            </Trans>
          </h1>
          <p className="hero-subtitle">
            {t('hero.subtitle')}
          </p>
        </div>
        <div className="hero-glow"></div>
      </section>

      <section className="events-section container">
        <div className="section-header">
          <h2>{t('filters.upcoming')}</h2>
          <div className="filter-tags">
            <span
              className={`tag ${selectedCategory === 'All' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('All')}
            >
              {t('filters.all')}
            </span>
            <span
              className={`tag ${selectedCategory === 'Music' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Music')}
            >
              {t('filters.music')}
            </span>
            <span
              className={`tag ${selectedCategory === 'Art' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Art')}
            >
              {t('filters.art')}
            </span>
            <span
              className={`tag ${selectedCategory === 'Tech' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Tech')}
            >
              {t('filters.tech')}
            </span>
            <span
              className={`tag ${selectedCategory === 'Food' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Food')}
            >
              {t('filters.food')}
            </span>
          </div>
        </div>

        <div className="events-grid">
          {loading ? (
            <div className="loading-state">
              <i className="fa-solid fa-spinner fa-spin"></i> {t('common.loading')}
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
              <p>{t('common.noEvents', { location })}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );

  return (
    <Router>
      <div className="app">
        <Navbar
          onLoginClick={() => setIsLoginOpen(true)}
          onCreateEventClick={() => setIsCreateEventOpen(true)}
          location={location}
          setLocation={setLocation}
          user={user}
          onLogout={handleLogout}
        />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>

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

        <CreateEventModal
          isOpen={isCreateEventOpen}
          onClose={() => setIsCreateEventOpen(false)}
          onEventCreated={handleCreateEventSuccess}
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
    </Router>
  );
}

export default App;
