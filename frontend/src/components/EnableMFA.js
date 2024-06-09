import React, { useState } from 'react';
import axiosInstance from '../components/axiosConfig';
import { useNavigate } from 'react-router-dom';
import './EnableMFA.css';

const EnableMFA = () => {
  const [qrCode, setQrCode] = useState('');
  const [message, setMessage] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const handleEnableMFA = async () => {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        setMessage('You must be logged in to enable MFA.');
        return;
      }

      const response = await axiosInstance.post('/auth/enable-mfa', {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setMessage('MFA enabled. Scan the QR code with your MFA app and enter the token below.');
    } catch (error) {
      console.error('Error enabling MFA:', error);
      setMessage(error.response?.data.message || 'Error enabling MFA');
    }
  };

  const handleVerifyMFA = async () => {
    try {
      const authToken = localStorage.getItem('token');
      if (!authToken) {
        setMessage('You must be logged in to verify MFA.');
        return;
      }

      const response = await axiosInstance.post('/auth/verify-mfa', { token }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setMessage(response.data.message);
      if (response.data.message === 'MFA verified and enabled') {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error verifying MFA:', error);
      setMessage(error.response?.data.message || 'Invalid MFA token');
    }
  };

  return (
    <div className="enable-mfa-container">
      <h2>Enable MFA</h2>
      <button onClick={handleEnableMFA}>Enable MFA</button>
      {qrCode && (
        <div>
          <p>Scan this QR code with your MFA app:</p>
          <img src={qrCode} alt="QR Code" />
          <p>Or enter this secret manually: {secret}</p>
          <input
            type="text"
            placeholder="Enter MFA token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button onClick={handleVerifyMFA}>Verify MFA</button>
        </div>
      )}
      <p>{message}</p>
    </div>
  );
};

export default EnableMFA;
