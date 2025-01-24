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
    const [unreadNotifications, setUnreadNotifications] = useState(0); // Unread notifications state

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
        getUnreadNotifications(); // Fetch unread notifications count on component mount
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
        window.location.reload(); // Reload the page to apply the new theme
    };

    return (
        <div className="navbar sticky top-0 bg-base-100 z-10 shadow-md">
            <div className="flex-1 flex items-center">
                <label htmlFor="left-sidebar-drawer" className="btn btn-primary drawer-button lg:hidden">
                    <Bars3Icon className="h-5 w-5" />
                </label>
                <h1 className="text-2xl font-semibold ml-2">{pageTitle}</h1>
            </div>
            <div className="flex-none flex items-center space-x-4 ml-auto">
                <label className="swap">
                    <input type="checkbox" onClick={handleThemeToggle} />
                    <SunIcon data-set-theme="light" className={"fill-current w-6 h-6 " + (currentTheme === "dark" ? "swap-on" : "swap-off")} />
                    <MoonIcon data-set-theme="dark" className={"fill-current w-6 h-6 " + (currentTheme === "light" ? "swap-on" : "swap-off")} />
                </label>
                <button className="btn btn-ghost btn-circle" onClick={() => openNotification()}>
                    <div className="indicator">
                        <BellIcon className="h-6 w-6" />
                        {unreadNotifications > 0 ? <span className="indicator-item badge badge-secondary badge-sm">{unreadNotifications}</span> : null}
                    </div>
                </button>
                <div>
                    <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-circle avatar flex items-center">
                            <div className="w-10 rounded-full mr-2">
                                <img src={user ? user.avatar : "https://placeimg.com/80/80/people"} alt="profile" />
                            </div>
                        </label>
                        <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                            <li><Link to={'/profile'}>Profile</Link></li>
                            <div className="divider mt-0 mb-0"></div>
                            <li><a onClick={logoutHandler}>Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <span>{user ? `${user.fname} ` : 'Loading...'}</span>
        </div>
    );
}

export default Header;