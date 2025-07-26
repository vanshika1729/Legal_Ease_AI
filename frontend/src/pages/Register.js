import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL; 
      const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('Registration failed');
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      navigate('/');
    } catch (err) {
      setMsg('Registration failed. Username may already exist.');
    }
  };

  return (
    <div className="auth-form">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input placeholder="Username" type='text' value={username} onChange={e => setUsername(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className='secondary-btn' type="submit">Register</button>
      </form>
      {msg && <div style={{color: '#ff6b6b', marginTop: '1rem'}}>{msg}</div>}
    </div>
  );
};

export default Register;
