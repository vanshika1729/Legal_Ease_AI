import React from 'react';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <h3 className="footer-logo">LegalEase AI</h3>
        <p className="footer-text">
          Automating legal document generation for everyone.
        </p>
        <small className="website-rights">
          © LegalEase AI {new Date().getFullYear()}. All Rights Reserved.
        </small>
      </div>
    </footer>
  );
};

export default Footer;