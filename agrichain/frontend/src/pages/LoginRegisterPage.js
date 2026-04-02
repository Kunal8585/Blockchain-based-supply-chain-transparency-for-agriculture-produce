import React, { useState } from 'react';
import './PageStyles.css'; // Assume generic styles for these premium pages

const LoginRegisterPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="premium-container">
      <div className="card glassmorphism">
        <h2>{isLogin ? 'Login' : 'Register'} to AgriChain</h2>
        <form className="dynamic-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Enter your name" />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" />
          </div>
          <button className="primary-btn pulse-animation">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p className="toggle-text" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </p>
      </div>
    </div>
  );
};

export default LoginRegisterPage;
