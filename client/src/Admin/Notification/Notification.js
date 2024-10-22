import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = sessionStorage.getItem('token'); // Load token from sessionStorage
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in headers
        },
      };

      try {
        // Use process.env.REACT_APP_API for the base API URL
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/notifications`, config);
        setNotifications(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications.');
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notifId) => {
    const token = sessionStorage.getItem('token'); // Load token from sessionStorage
    const config = {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in headers
      },
    };

    try {
      // Use process.env.REACT_APP_API for the base API URL
      await axios.put(`${process.env.REACT_APP_API}/api/notifications/${notifId}/markAsRead`, {}, config);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notifId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div>
      <h2>Notifications</h2>
      {error && <p className="text-red-500">{error}</p>}
      <ul>
        {notifications.map((notif) => (
          <li key={notif._id} style={{ background: notif.read ? '#ddd' : '#fff' }}>
            <p>{notif.title}</p>
            <p>{notif.description}</p>
            <button onClick={() => markAsRead(notif._id)}>
              {notif.read ? 'Read' : 'Mark as Read'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
    