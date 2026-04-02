import React from 'react';

const AboutPlatformPage = () => {
  return (
    <div className="premium-container">
      <div className="card glassmorphism about-card">
        <h1>About AgriChain Platform</h1>
        <p>
          AgriChain provides blockchain-based supply chain transparency for agricultural produce.
          Our mission is to establish a verifiable, immutable record of food origin and logistics,
          instilling trust from the farm to the consumer's table.
        </p>
        <div className="feature-grid">
          <div className="feature-box">🛡️ Iron-clad Security via Smart Contracts</div>
          <div className="feature-box">📦 Real-time Logistics Tracking</div>
          <div className="feature-box">👨‍🌾 Direct Farmer Empowerment</div>
        </div>
      </div>
    </div>
  );
};

export default AboutPlatformPage;
