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
import Trace from './pages/Trace';
import UpdateStatus from './pages/UpdateStatus';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Web3Provider, useWeb3Context } from './context/Web3Context';
import './App.css';

// Protected Route Logic
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" />;
  return children;
};

const AppNavigation = () => {
  const { isLoggedIn, logout } = useAuth();
  const { connectWallet, address, role } = useWeb3Context();

  // Helper to map numeric roles from Solidity to UI labels
  // 2 = Farmer, 5 = Retailer
  const getRoleLabel = (r) => {
    if (r === 2 || r === '2' || r === 'Farmer') return 'Farmer';
    if (r === 5 || r === '5' || r === 'Retailer') return 'Retailer';
    return 'Consumer';
  };

  const currentRoleLabel = getRoleLabel(role);

  return (
    <nav className="navbar">
      <div className="nav-brand">🌾 AgriChain</div>
      <div className="nav-links">
        {!isLoggedIn ? (
          <>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>About</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>Contact</NavLink>
            {/* Consumer can always access Trace even without login */}
            <NavLink to="/blockchain" className={({ isActive }) => isActive ? 'active' : ''}>Track Product</NavLink>
            <NavLink to="/login" className={({ isActive }) => isActive ? 'active login-btn' : 'login-btn'}>Login / Register</NavLink>
          </>
        ) : (
          <>
            {/* Farmer View (Role 2) */}
            {currentRoleLabel === 'Farmer' && (
              <>
                <NavLink to="/producers" className={({ isActive }) => isActive ? 'active' : ''}>Producers</NavLink>
                <NavLink to="/products" className={({ isActive }) => isActive ? 'active' : ''}>Products</NavLink>
              </>
            )}

            {/* Retailer View (Role 5) - Amazon Style Logistics */}
            {currentRoleLabel === 'Retailer' && (
              <NavLink to="/shipments" className={({ isActive }) => isActive ? 'active' : ''}>Shipments</NavLink>
            )}

            {/* Public/Blockchain View */}
            <NavLink to="/blockchain" className={({ isActive }) => isActive ? 'active' : ''}>Blockchain Ledger</NavLink>

            {address ? (
              <div className="wallet-chip">
                <span className="wallet-role">{currentRoleLabel}</span>
                <span className="wallet-addr">{address.substring(0, 6)}...{address.substring(38)}</span>
              </div>
            ) : (
              <button onClick={connectWallet} className="btn-wallet">🦊 Connect Wallet</button>
            )}

            <button onClick={logout} className="login-btn-logout">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Web3Provider>
        <Router>
          <div className="app">
            <AppNavigation />
            <main className="main-content">
              <Routes>
                {/* Public Routes - No Login Required */}
                <Route path="/about" element={<AboutPlatformPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/login" element={<AuthPage />} />

                {/* AMAZON TRACKING: Publicly accessible via QR or ID */}
                <Route path="/trace/:id" element={<Trace />} />
                <Route path="/blockchain" element={<Blockchain />} />

                {/* Default Route */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Protected Routes - Login Required */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/producers" element={<ProtectedRoute><Producers /></ProtectedRoute>} />
                <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
                <Route path="/shipments" element={<ProtectedRoute><Shipments /></ProtectedRoute>} />
                <Route path="/update-status/:id" element={<ProtectedRoute><UpdateStatus /></ProtectedRoute>} />
              </Routes>
            </main>
          </div>
        </Router>
      </Web3Provider>
    </AuthProvider>
  );
}

export default App;