import React from 'react';
import axios from 'axios';

const MFASetup = () => {
  const handleMFASetup = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/setup-mfa', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('MFA Setup successful', response.data);
    } catch (error) {
      console.error('Error setting up MFA', error);
    }
  };

  return (
    <div>
      <h1>Set up MFA</h1>
      <button onClick={handleMFASetup}>Setup MFA</button>
    </div>
  );
};

export default MFASetup;
