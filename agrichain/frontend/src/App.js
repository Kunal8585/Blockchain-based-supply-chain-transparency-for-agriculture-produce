import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Producers from './pages/Producers';
import Products from './pages/Products';
import Shipments from './pages/Shipments';
import Blockchain from './pages/Blockchain';
import AuthPage from './pages/AuthPage';
import AboutPlatformPage from './pages/AboutPlatformPage';
import ContactUsPage from './pages/ContactUsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" />;
  return children;
};

const AppNavigation = () => {
  const { isLoggedIn, logout } = useAuth();
  return (
    <nav className="navbar">
      <div className="nav-brand">🌾 AgriChain</div>
      <div className="nav-links">
        {!isLoggedIn ? (
          <>
            <NavLink to="/about" className={({isActive}) => isActive ? 'active' : ''}>About</NavLink>
            <NavLink to="/contact" className={({isActive}) => isActive ? 'active' : ''}>Contact</NavLink>
            <NavLink to="/login" className={({isActive}) => isActive ? 'active login-btn' : 'login-btn'}>Login / Register</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
            <NavLink to="/producers" className={({isActive}) => isActive ? 'active' : ''}>Producers</NavLink>
            <NavLink to="/products" className={({isActive}) => isActive ? 'active' : ''}>Products</NavLink>
            <NavLink to="/shipments" className={({isActive}) => isActive ? 'active' : ''}>Shipments</NavLink>
            <NavLink to="/blockchain" className={({isActive}) => isActive ? 'active' : ''}>Blockchain</NavLink>
            <button onClick={logout} className="login-btn" style={{border: 'none', cursor: 'pointer', background: '#d32f2f', padding: '0.5rem 1rem', borderRadius: '4px', color:'white'}}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppNavigation />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/about" element={<AboutPlatformPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/login" element={<AuthPage />} />
              
              {/* Fallback to Login */}
              <Route path="/" element={<Navigate to="/login" />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/producers" element={<ProtectedRoute><Producers /></ProtectedRoute>} />
              <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
              <Route path="/shipments" element={<ProtectedRoute><Shipments /></ProtectedRoute>} />
              <Route path="/blockchain" element={<ProtectedRoute><Blockchain /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
