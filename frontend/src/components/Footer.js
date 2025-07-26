import React from 'react';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <h3 className="footer-logo">LegalEase AI</h3>
        <p className="footer-text">
          Automating legal document generation for everyone.
        </p>
        <p className='footer-text'>
          DISCLAIMER: The information provided by LegalEase AI is for general informational purposes only and should not be construed as legal advice. Always consult with a qualified attorney for specific legal concerns.
        </p>
        <small className="website-rights">
          © LegalEase AI {new Date().getFullYear()}. All Rights Reserved.
        </small>
      </div>
    </footer>
  );
};

export default Footer;