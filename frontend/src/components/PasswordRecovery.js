import React, { useState } from 'react';
import axiosInstance from '../components/axiosConfig';
import './PasswordRecovery.css';

const PasswordRecovery = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordRecovery = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/password-reset-request', { email });
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error sending password recovery email:', error);
      setMessage(error.response?.data?.message || 'Error sending password recovery email.');
    }
  };

  return (
    <div className="password-recovery-container">
      <h2>Password Recovery</h2>
      <form onSubmit={handlePasswordRecovery} className="password-recovery-form">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <button type="submit">Recover Password</button>
      </form>
      <p className="message">{message}</p>
    </div>
  );
};

export default PasswordRecovery;
