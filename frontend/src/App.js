import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout'; 
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NoticeGenerator from './pages/NoticeGenerator';
import Result from './pages/Result';
import SavedNotices from './pages/SavedNotices';

import './App.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleSetToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleClearToken = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <ToastContainer position="bottom-right" autoClose={5000} theme="dark" />
      <Routes>
        <Route path="/" element={<Layout token={token} onLogout={handleClearToken} />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login onLogin={handleSetToken} />} />
          <Route path="register" element={<Register onRegister={handleSetToken} />} />
          <Route path="generate" element={token ? <NoticeGenerator /> : <Navigate to="/login" />} />
          <Route path="result" element={token ? <Result /> : <Navigate to="/login" />} />
          <Route path="saved" element={token ? <SavedNotices /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;