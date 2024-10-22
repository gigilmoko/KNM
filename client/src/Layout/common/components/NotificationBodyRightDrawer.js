import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { EyeIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const NotificationBodyRightDrawer = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
  const currentTheme = localStorage.getItem("theme") || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = sessionStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
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
    const token = sessionStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      await axios.put(`${process.env.REACT_APP_API}/api/notifications/${notifId}/markAsRead`, {}, config);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notifId ? { ...notif, read: !notif.read } : notif
        )
      );
      setMenuOpen(null);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notifId) => {
    const token = sessionStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      await axios.delete(`${process.env.REACT_APP_API}/api/notifications/${notifId}`, config);
      setNotifications((prev) => prev.filter((notif) => notif._id !== notifId));
      setMenuOpen(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <>
      {error && <p className="text-red-500">{error}</p>}
      <div className="notification-drawer">
        {notifications.map((notif) => (
          <div
            key={notif._id}
            className="grid mt-3 card rounded-box p-3 cursor-pointer relative"
            style={{
              backgroundColor: notif.read
                ? currentTheme === "light" ? '#8ecae6' : '#ffb703'
                : currentTheme === "light" ? '#219ebc' : '#fb8500'
            }}
            onClick={() => markAsRead(notif._id)}
          >
            <p className="font-bold" style={{ color: 'black' }}>{notif.title}</p>
            <p style={{ color: 'black' }}>{notif.description}</p>

            <div className="absolute right-2 top-2">
  <button onClick={(e) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === notif._id ? null : notif._id);
  }} style={{ color: 'black' }}>
    ⋮
  </button>
  {menuOpen === notif._id && (
    <div className="absolute right-0 top-8 bg-white shadow-lg p-2 rounded flex space-x-2">
      <button onClick={(e) => {
          e.stopPropagation();
          setMenuOpen(null);
        }} 
        className="flex items-center p-2 hover:bg-gray-200">
        <XMarkIcon className="h-5 w-5 mr-2" style={{ color: 'black' }} /> {/* XMarkIcon in black */}
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          markAsRead(notif._id);
        }} 
        className="flex items-center p-2 hover:bg-gray-200">
        <EyeIcon className="h-5 w-5 mr-2" style={{ color: 'black' }} /> {/* EyeIcon in black */}
      </button>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          deleteNotification(notif._id);
        }} 
        className="flex items-center p-2 hover:bg-gray-200 text-red-500">
        <TrashIcon className="h-5 w-5 mr-2" style={{ color: 'black' }} /> {/* TrashIcon in black */}
      </button>
    </div>
  )}
</div>

          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationBodyRightDrawer;
