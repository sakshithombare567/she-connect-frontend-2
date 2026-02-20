import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';


// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import StartTrip from './pages/StartTrip';
import Blog from './pages/Blog';
import Settings from './pages/Settings';
import MatchMaking from './pages/MatchMaking';

import ConnectedPersonal from './components/ConnectedPersonal';
import ConnectedAnonymous from "./components/ConnectedAnonymous";


function App() {
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/`);
        const data = await response.json();
        console.log("Backend Health Check:", data);
      } catch (error) {
        console.error("Backend Connection Failed:", error);
      }
    };

    checkBackendHealth();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
            path="/match-making"
            element={
              <ProtectedRoute>
                <MatchMaking />
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
