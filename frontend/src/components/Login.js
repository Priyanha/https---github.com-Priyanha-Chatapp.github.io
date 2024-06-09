import React, { useState } from 'react';
import axiosInstance from '../components/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      setMessage(response.data.message);
      if (response.data.otpRequired) {
        setIsOtpSent(true);
      } else {
        // If OTP is not required, you can directly set the token and navigate to profile
        localStorage.setItem('token', response.data.token);
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setMessage(error.response?.data?.message || 'Error logging in');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('token', response.data.token);
      navigate('/profile');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setMessage(error.response?.data?.message || 'Invalid OTP');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {!isOtpSent ? (
        <form onSubmit={handleLogin} className="login-form">
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
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="otp-form">
          <input
            type="text"
            placeholder="Enter your OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Verify OTP</button>
        </form>
      )}
      <p className="message">{message}</p>
      <div className="reset-password-container">
        <Link to="/password-recovery">Forgot Password?</Link>
      </div>
    </div>
  );
};

export default Login;
