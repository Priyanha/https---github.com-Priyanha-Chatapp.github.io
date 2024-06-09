import React, { useState } from 'react';
import axiosInstance from '../components/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css';
import zxcvbn from 'zxcvbn';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({});
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const passwordStrengthResult = zxcvbn(password);
    if (passwordStrengthResult.score < 3) {
      setMessage('Password is too weak. Please choose a stronger password.');
      return;
    }

    try {
      const response = await axiosInstance.post('/auth/register', { username, email, password });
      setMessage(response.data.message);
      if (response.data.success) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error:', error.response || error.message);
      setMessage(error.response ? error.response.data.message : 'Error registering.');
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(zxcvbn(newPassword));
  };

  

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleRegister} className="register-form">
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
        />
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
          required
          autoComplete="new-password"
        />
        <div className="password-strength">
          <progress value={passwordStrength.score} max="4" />
          <p>{passwordStrength.feedback?.warning || ''}</p>
          <ul>
            {passwordStrength.feedback?.suggestions?.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
        <input
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <button type="submit">Register</button>
      </form>
      <p className="message">{message}</p>
      <div className="login-link">
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};

export default Register;
