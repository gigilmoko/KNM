import { themeChange } from 'theme-change';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon';
import MoonIcon from '@heroicons/react/24/outline/MoonIcon';
import SunIcon from '@heroicons/react/24/outline/SunIcon';
import { openRightDrawer } from '../features/common/rightDrawerSlice';
import { RIGHT_DRAWER_TYPES } from '../utils/globalConstantUtil';
import { NavLink, Routes, Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { noOfNotifications, pageTitle } = useSelector(state => state.header);
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem("theme"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
    }, [currentTheme]);

    const getProfile = async () => {
        const config = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
            console.log(data); // Log the fetched data
            setUser(data.user);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setError('Failed to load profile.');
            setLoading(false);
        }
    };

    const openNotification = () => {
        dispatch(openRightDrawer({ header: "Notifications", bodyType: RIGHT_DRAWER_TYPES.NOTIFICATION }));
    };

    const logoutHandler = async () => {
        try {
            await axios.get(`${process.env.REACT_APP_API}/api/logout`);
            // Optionally clear local storage and state
            localStorage.clear();
            // Navigate to home page
            navigate('/login');
            // Reload the window
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
        <div className="navbar sticky top-0 bg-base-100 z-10 shadow-md">
            <div className="flex-1 flex items-center">
                <label htmlFor="left-sidebar-drawer" className="btn btn-primary drawer-button lg:hidden">
                    <Bars3Icon className="h-5 w-5" />
                </label>
                <h1 className="text-2xl font-semibold ml-2">{pageTitle}</h1>
            </div>

            <div className="flex-none flex items-center space-x-4 ml-auto">
                <label className="swap">
                    <input type="checkbox" />
                    <SunIcon data-set-theme="light" data-act-class="ACTIVECLASS" className={"fill-current w-6 h-6 " + (currentTheme === "dark" ? "swap-on" : "swap-off")} />
                    <MoonIcon data-set-theme="dark" data-act-class="ACTIVECLASS" className={"fill-current w-6 h-6 " + (currentTheme === "light" ? "swap-on" : "swap-off")} />
                </label>

                <button className="btn btn-ghost btn-circle" onClick={() => openNotification()}>
                    <div className="indicator">
                        <BellIcon className="h-6 w-6" />
                        {noOfNotifications > 0 ? <span className="indicator-item badge badge-secondary badge-sm">{noOfNotifications}</span> : null}
                    </div>
                </button>
            <div>
            {/* <span className="text-center">{user ? `${user.fname}` : 'Loading...'}</span> */}
                <div className="dropdown dropdown-end">
                   
                    <label tabIndex={0} className="btn btn-ghost btn-circle avatar flex items-center">
                        <div className="w-10 rounded-full mr-2">
                            <img src={user ? user.avatar : "https://placeimg.com/80/80/people"} alt="profile" />
                            
                        </div>
                        <div>
                        {/* <span>{user ? `${user.fname} ` : 'Loading...'}</span> */}
                        </div>
                    </label>
                    
                    <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                        
                        <li className="justify-between">
                            <Link to={'/app/settings-profile'}>
                                Profile Settings
                                <span className="badge">New</span>
                            </Link>
                        </li>
                        <li><Link to={'/app/settings-billing'}>Bill History</Link></li>
                        <div className="divider mt-0 mb-0"></div>
                        <li><a onClick={logoutHandler}>Logout</a></li>
                    </ul>
                    
                    {/* <span>{user ? `${user.fname} ` : 'Loading...'}</span> */}
                </div>
                {/* <span>{user ? `${user.fname} ` : 'Loading...'}</span> */}
               
                </div>
            </div>
            <span>{user ? `${user.fname} ` : 'Loading...'}</span>
        </div>
    );
}

export default Header;
