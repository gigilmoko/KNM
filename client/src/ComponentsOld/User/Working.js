import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getUser, logout } from '../../utils/helpers';

const Working = () => {
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    console.log('Currently logged-in user:', user);
  }, [user]);

  const logoutHandler = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API}/api/logout`);
      // setUser({});
      logout(() => navigate('/'));
      // Reload the window after logging out
      window.location.reload();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        console.error(error.response.data.message);
      } else {
        console.error('An error occurred while logging out');
      }
    }
  };

  return (
    <div>
      <h1>Working</h1>
      <p>Currently logged-in user: {user ? user.email : 'No user logged in'}</p>
      <button onClick={logoutHandler} className="btn btn-danger">
        Logout
      </button>
    </div>
  );
};

export default Working;
