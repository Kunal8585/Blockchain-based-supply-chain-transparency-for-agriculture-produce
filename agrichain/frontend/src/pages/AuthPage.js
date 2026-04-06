import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PageStyles.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Consumer');
  const [error, setError] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    let endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    let payload = isLogin ? { username, password } : { username, email, password, role };

    try {
      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (isLogin) {
        // Here `data` contains username, role, and message from backend
        // Creating a full user object to store context
        login({ username: data.username, role: data.role }, data.token);
        navigate('/dashboard'); // Secure redirect to main dashboard
      } else {
        setIsLogin(true);
        setError('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="premium-container">
      <div className="card glassmorphism">
        <h2>{isLogin ? 'Login' : 'Register'} to AgriChain</h2>
        {error && <div style={{color: error.includes('succ') ? 'green' : 'red', marginBottom: '1rem'}}>{error}</div>}
        <form className="dynamic-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" placeholder="Enter username" value={username} onChange={e=>setUsername(e.target.value)} required/>
          </div>
          {!isLogin && (
            <>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="Enter email" value={email} onChange={e=>setEmail(e.target.value)} required/>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select name="role" value={role} onChange={e=>setRole(e.target.value)} required>
                  <option value="Consumer">Consumer (General Public)</option>
                  <option value="Farmer">Farmer (Producer)</option>
                  <option value="Retailer">Retailer (Store Owner)</option>
                </select>
              </div>
            </>
          )}
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" value={password} onChange={e=>setPassword(e.target.value)} required/>
          </div>
          <button type="submit" className="primary-btn pulse-animation">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p className="toggle-text" style={{cursor: 'pointer', marginTop: '1rem', color: '#1976d2'}} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
