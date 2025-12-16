import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import CreateEventModal from './components/CreateEventModal';
import EventDetailModal from './components/EventDetailModal';
import Profile from './pages/Profile';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import MyEvents from './pages/MyEvents';
import AdminPanel from './pages/AdminPanel';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import ScannerPage from './pages/ScannerPage';
import TicketPurchase from './pages/TicketPurchase';
import MyTickets from './pages/MyTickets';
import Teams from './pages/Teams';
import EventStats from './pages/EventStats';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import authService from './services/authService';
import { getEvents } from './services/api';
import './App.css';

function App() {
  const { t } = useTranslation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isEventDetailOpen, setIsEventDetailOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(authService.getUser());

  useEffect(() => {
    const currentUser = authService.getUser();
    if (currentUser && JSON.stringify(currentUser) !== JSON.stringify(user)) {
      setUser(currentUser);
    }
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      // ... same logic
      setEvents(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      // ... same logic
      if (err.response?.status === 401) {
        // ...
      }
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ... handlers ...

  const handleLoginSuccess = (response) => {
    console.log('User logged in:', response);
    setUser(response.user || authService.getUser());
  };

  const handleRegisterSuccess = (response) => {
    console.log('User registered:', response);
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const handleCreateEventSuccess = () => {
    console.log('Event created successfully');
    fetchEvents();
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
    <Router>
      <div className="app-container">
        <Navbar
          user={user}
          onLoginClick={() => setIsLoginOpen(true)}
          onRegisterClick={() => setIsRegisterOpen(true)}
        />

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                events={events}
                loading={loading}
                error={error}
                handleEventClick={handleEventClick}
              />
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/create-event"
            element={
              <ProtectedRoute user={user} requiredRole={['promotor', 'admin']}>
                <CreateEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-events"
            element={
              <ProtectedRoute user={user} requiredRole={['promotor', 'admin']}>
                <MyEvents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-event/:eventId"
            element={
              <ProtectedRoute user={user} requiredRole={['promotor', 'admin']}>
                <EditEvent />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scanner"
            element={
              <ProtectedRoute user={user} requiredRole={['scanner', 'promotor', 'owner', 'admin']}>
                <ScannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route path="/tickets/purchase/:eventoId" element={<TicketPurchase />} />
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute user={user}>
                <MyTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams"
            element={
              <ProtectedRoute user={user}>
                <Teams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/event-stats/:eventId"
            element={
              <ProtectedRoute user={user} requiredRole={['promotor', 'admin']}>
                <EventStats />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
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
