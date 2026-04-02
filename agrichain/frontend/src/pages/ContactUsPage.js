import React from 'react';

const ContactUsPage = () => {
  return (
    <div className="premium-container">
      <div className="card glassmorphism">
        <h2>Contact Us</h2>
        <p>Have questions about AgriChain? We'd love to hear from you.</p>
        <form className="dynamic-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" placeholder="Your Name" />
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea rows="4" placeholder="How can we help?"></textarea>
          </div>
          <button className="primary-btn hover-glow">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default ContactUsPage;
