import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <h1>Welcome to the Secure Chat App</h1>
      <div className="welcome-buttons">
        <button onClick={() => navigate('/register')} className="welcome-button">Register</button>
        <button onClick={() => navigate('/login')} className="welcome-button">Login</button>
      </div>
    </div>
  );
};

export default Welcome; // Ensure this line is present
