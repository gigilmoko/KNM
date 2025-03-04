import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon';
import MoonIcon from '@heroicons/react/24/outline/MoonIcon';
import SunIcon from '@heroicons/react/24/outline/SunIcon';
import { openRightDrawer } from './common/rightDrawerSlice';
import { RIGHT_DRAWER_TYPES } from '../utils/globalConstantUtil';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { themeChange } from 'theme-change';

function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'light');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const isAuthPage = location.pathname === "/register" || location.pathname === "/login";

    useEffect(() => {
        themeChange(false);
        if (!localStorage.getItem('theme')) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setCurrentTheme(prefersDark ? 'dark' : 'light');
        }
        getProfile();
        getUnreadNotifications();
    }, [currentTheme]);

    const getProfile = async () => {
        const config = {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
        };
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
            setUser(data.user);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load profile.');
            setLoading(false);
        }
    };

    const getUnreadNotifications = async () => {
        const config = {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
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
        dispatch(openRightDrawer({ header: 'Notifications', bodyType: RIGHT_DRAWER_TYPES.NOTIFICATION }));
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
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setCurrentTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        window.location.reload();
    };

    const handleNavigation = (path) => {
        if (location.pathname !== path) {
            navigate(path); // Navigate to the new page
        }
    };
    

    return (
        <div className={`navbar sticky top-0 bg-base-100 z-10 shadow-md ${currentTheme === 'dark' ? 'text-white' : 'text-black'}`}>
        <div className="flex-1 flex items-center">
            <label htmlFor="left-sidebar-drawer" className="btn btn-primary drawer-button lg:hidden">
                <Bars3Icon className="h-5 w-5" />
            </label>
    
            {/* Replace KNM text with an image */}
            <Link to="/" className="flex items-center">
                <img 
                    src="https://res.cloudinary.com/dglawxazg/image/upload/v1741112980/image_2025-03-05_022855838-removebg-preview_thwgac.png"  // Update this with the correct path to your KNM logo 
                    alt="KNM Logo"
                    className="h-10 w-auto mt-[-4px]"
                />
                <h1 className="text-2xl font-semibold ml-2 pb-1">Kababaihan ng Maynila</h1>
            </Link>
        </div>
    
        <div className="flex-none font-semibold flex items-center space-x-6 ml-auto">
    {[
        { name: 'About Us', path: '/about' },
        { name: 'Events', path: '/event-list' },
        { name: 'Our Products', path: '/products' },
        { name: 'Blogs', path: '/blog' },
        { name: 'Contact Us', path: '/contact' },
        
    ].map((item, index) => (
        <button
            key={index}
            className="btn btn-ghost text-sm font-medium"
            style={{ color: '#df1f47' }}
            onClick={() => handleNavigation(item.path)}
        >
            {item.name}
        </button>
    ))}

    <label className="swap">
        <input type="checkbox" onClick={handleThemeToggle} />
        <SunIcon className={`fill-current w-6 h-6 ${currentTheme === 'dark' ? 'swap-on' : 'swap-off'}`} />
        <MoonIcon className={`fill-current w-6 h-6 ${currentTheme === 'light' ? 'swap-on' : 'swap-off'}`} />
    </label>

    {loading ? (
        <span>Loading...</span>
    ) : user ? (
        <div className="flex items-center space-x-4">
            <button className="btn btn-ghost btn-circle" onClick={openNotification}>
                <div className="indicator">
                    <BellIcon className="h-6 w-6" />
                    {unreadNotifications > 0 && (
                        <span className="indicator-item badge badge-secondary badge-sm">
                            {unreadNotifications}
                        </span>
                    )}
                </div>
            </button>

            <div className="flex items-center space-x-2">
                <span className="font-medium">{user.fname}</span>
                <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-circle avatar flex items-center">
                        <div className="w-10 rounded-full mr-2">
                            <img
                                src={user.avatar || 'https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png'}
                                alt="profile"
                            />
                        </div>
                    </label>
                    <ul
                        tabIndex={0}
                        className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
                    >
                        <li>
                            <Link to="/profile">Profile</Link>
                        </li>
                        <div className="divider mt-0 mb-0"></div>
                        <li>
                            <a onClick={logoutHandler}>Logout</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    ) : (
        !isAuthPage && (
            <div className="flex space-x-2">
                <Link to="/login" className="btn btn-outline" style={{ color: '#df1f47', borderColor: '#df1f47' }}>
                    Login
                </Link>
                <Link to="/register" className="btn" style={{ backgroundColor: '#df1f47', color: 'white' }}>
                    Sign Up
                </Link>
            </div>
        )
    )}
</div>

    </div>
    
    );
}

export default Header;
