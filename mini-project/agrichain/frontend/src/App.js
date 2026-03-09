import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Producers from './pages/Producers';
import Products from './pages/Products';
import Shipments from './pages/Shipments';
import Blockchain from './pages/Blockchain';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-brand">🌾 AgriChain</div>
          <div className="nav-links">
            <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
            <NavLink to="/producers" className={({isActive}) => isActive ? 'active' : ''}>Producers</NavLink>
            <NavLink to="/products" className={({isActive}) => isActive ? 'active' : ''}>Products</NavLink>
            <NavLink to="/shipments" className={({isActive}) => isActive ? 'active' : ''}>Shipments</NavLink>
            <NavLink to="/blockchain" className={({isActive}) => isActive ? 'active' : ''}>Blockchain</NavLink>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/producers" element={<Producers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/blockchain" element={<Blockchain />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
