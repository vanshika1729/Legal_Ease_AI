import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';


const Home = () => (
  <div className="home">
    <img src={logo} alt="LegalEase AI Logo" className="home-logo" />
    <hr/>
    <h1>LegalEase AI</h1>
    <p>
      LegalEase AI empowers everyone to generate legally sound notices—rent disputes, salary complaints, consumer grievances or any problem you face—without a lawyer. Generate a statement according to you, get a formal legal document instantly.
    </p>
    <Link to="/generate" className="start-btn">Start Generating</Link>
  </div>
);

export default Home;