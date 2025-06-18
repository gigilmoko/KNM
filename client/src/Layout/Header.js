import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon';
import MoonIcon from '@heroicons/react/24/outline/MoonIcon';
import SunIcon from '@heroicons/react/24/outline/SunIcon';
import { openRightDrawer } from './common/rightDrawerSlice';
import { RIGHT_DRAWER_TYPES } from '../utils/globalConstantUtil';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { themeChange } from 'theme-change';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pageTitle } = useSelector(state => state.header);
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem("theme"));
  const [user, setUser] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    themeChange(false);
    if (currentTheme === null) {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setCurrentTheme("dark");
      } else {
        setCurrentTheme("light");
      }
    }
    getProfile();
    getUnreadNotifications();
    // eslint-disable-next-line
  }, [currentTheme]);

  const getProfile = async () => {
    const config = {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      },
    };
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
      setUser(data.user);
    } catch (error) {
      console.error('Failed to load profile.');
    }
  };

  const getUnreadNotifications = async () => {
    const config = {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      },
    };
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/notifications/unread-count`, config);
      setUnreadNotifications(data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread notifications count', error);
    }
  };

  const openNotification = () => {
    dispatch(openRightDrawer({ header: "Notifications", bodyType: RIGHT_DRAWER_TYPES.NOTIFICATION }));
  };

  const logoutHandler = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API}/api/logout`);
      sessionStorage.clear();
      navigate('/login');
      window.location.reload();
    } catch (error) {
      console.error('An error occurred while logging out', error);
    }
  };

  const handleThemeToggle = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setCurrentTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 shadow-md transition-colors">
      <nav className="container mx-auto flex items-center justify-between px-2 sm:px-4 py-2">
        {/* Left: Sidebar & Title */}
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-[#fff0f4] dark:hover:bg-[#2a0d16] transition"
            aria-label="Open sidebar"
            onClick={() => document.getElementById('left-sidebar-drawer').click()}
          >
            <Bars3Icon className="h-6 w-6 text-[#df1f47]" />
          </button>
          <h1 className="text-lg sm:text-2xl font-bold text-[#df1f47] truncate max-w-[160px] sm:max-w-xs">{pageTitle}</h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Theme Toggle */}
          <button
            className="p-2 rounded-full hover:bg-[#fff0f4] dark:hover:bg-[#2a0d16] transition"
            aria-label="Toggle theme"
            onClick={handleThemeToggle}
          >
            {currentTheme === "dark" ? (
              <SunIcon className="w-6 h-6 text-yellow-400" />
            ) : (
              <MoonIcon className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {/* Notifications */}
          <button
            className="relative p-2 rounded-full hover:bg-[#fff0f4] dark:hover:bg-[#2a0d16] transition"
            aria-label="Notifications"
            onClick={openNotification}
          >
            <BellIcon className="h-6 w-6 text-[#df1f47]" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#df1f47] text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center gap-2 p-1 rounded-full hover:bg-[#fff0f4] dark:hover:bg-[#2a0d16] transition"
              aria-label="User menu"
              tabIndex={0}
            >
              <img
                src={user?.avatar || "https://placeimg.com/80/80/people"}
                alt="profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-[#df1f47]"
              />
              <span className="hidden md:inline font-medium text-sm">{user ? user.fname : 'Loading...'}</span>
            </button>
            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 pointer-events-none group-focus-within:pointer-events-auto group-hover:pointer-events-auto transition-all duration-200 z-20">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm hover:bg-[#fff0f4] dark:hover:bg-[#2a0d16] transition"
              >
                Profile
              </Link>
              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
              <button
                onClick={logoutHandler}
                className="w-full text-left px-4 py-2 text-sm text-[#df1f47] hover:bg-[#fff0f4] dark:hover:bg-[#2a0d16] transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;