import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';


// Pages
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Requests from './pages/Requests';
import StartTrip from './pages/StartTrip';
import Blog from './pages/Blog';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import LiveConnection from './pages/LiveConnection';

import ConnectedPersonal from './components/ConnectedPersonal';
import ConnectedAnonymous from "./components/ConnectedAnonymous";
import MapLibreMap from "./components/MapLibre";
import EmergencyModal from './components/EmergencyModal';

function App() {
  useEffect(() => {
    // Backend health check removed as it was causing JSON parsing errors
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <Requests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/start-trip"
            element={
              <ProtectedRoute>
                <StartTrip />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blogs"
            element={
              <ProtectedRoute>
                <Blog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/live-connection"
            element={
              <ProtectedRoute>
                <LiveConnection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/connected-personal"
            element={
              <ProtectedRoute>
                <ConnectedPersonal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/connected-anonymous"
            element={
              <ConnectedAnonymous />
            }
          />


        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
