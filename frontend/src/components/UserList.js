import React, { useState, useEffect } from 'react';
import axiosInstance from '../components/axiosConfig';
import { Link } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const authToken = localStorage.getItem('token');
        console.log('Token being retrieved in UserList:', authToken); // Debugging line
        if (!authToken) {
          throw new Error('No authentication token found');
        }

        const res = await axiosInstance.get('/auth/users', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Registered Users</h2>
      <ul>
        {users.map(user => (
          <li key={user._id}>
            {user.username} <Link to={`/chat/${user._id}`}>Chat</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
