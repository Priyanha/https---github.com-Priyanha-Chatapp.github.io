
// export default Profile;
import React, { useState, useEffect } from 'react';
import axiosInstance from '../components/axiosConfig';
import { useNavigate } from 'react-router-dom';
import './Profile.css'; // Make sure to create this CSS file
import UserList from './UserList';

const Profile = () => {
  const [user, setUser] = useState({});
  const [enableMfa, setEnableMfa] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authToken = localStorage.getItem('token');
        console.log('Token being retrieved in Profile:', authToken); // Debugging line
        if (!authToken) {
          throw new Error('No authentication token found');
        }

        const res = await axiosInstance.get('/auth/profile', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleEnableMfaClick = () => {
    setEnableMfa(true);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Welcome, {user.username}</h1>
        <UserList />
        <p>{user.email}</p>
     
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

    </div>
  );
};

export default Profile;
