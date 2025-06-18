import React, { useEffect, useState } from 'react';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon';
import MoonIcon from '@heroicons/react/24/outline/MoonIcon';
import SunIcon from '@heroicons/react/24/outline/SunIcon';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { themeChange } from 'theme-change';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'light');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isAuthPage = location.pathname === "/register" || location.pathname === "/login";

    useEffect(() => {
        themeChange(false);
        if (!localStorage.getItem('theme')) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setCurrentTheme(prefersDark ? 'dark' : 'light');
        }
        getProfile();
        // eslint-disable-next-line
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
            setLoading(false);
        }
    };

    const logoutHandler = async () => {
        try {
            await axios.get(`${process.env.REACT_APP_API}/api/logout`);
            sessionStorage.clear();
            navigate('/login');
            window.location.reload();
        } catch (error) {}
    };

    const handleThemeToggle = () => {
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setCurrentTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        window.location.reload();
    };

    const handleNavigation = (path) => {
        setMobileMenuOpen(false);
        if (location.pathname !== path) {
            navigate(path);
        }
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/blog' },
        { name: 'Our Products', path: '/products' },
        { name: 'Contact Us', path: '/contact' },
    ];

    return (
        <nav className={`sticky top-0 z-30 w-full bg-base-100 shadow-md transition-colors duration-200 ${currentTheme === 'dark' ? 'text-white' : 'text-black'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo & Mobile menu button */}
                    <div className="flex items-center">
                        <button
                            className="lg:hidden mr-2 btn btn-ghost btn-circle"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Open menu"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        <Link to="/" className="flex items-center">
                            <img
                                src="https://res.cloudinary.com/dglawxazg/image/upload/v1741112980/image_2025-03-05_022855838-removebg-preview_thwgac.png"
                                alt="KNM Logo"
                                className="h-10 w-auto"
                            />
                            <span className="ml-2 text-lg md:text-2xl font-bold tracking-tight hidden sm:inline">Kababaihan ng Maynila</span>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center space-x-2">
                        {navLinks.map((item, idx) => (
                            <button
                                key={idx}
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
                            <span className="ml-2">Loading...</span>
                        ) : user ? (
                            <div className="flex items-center space-x-2 relative">
                                <span className="font-medium hidden md:inline">{user.fname}</span>
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
                                        {user.role === 'admin' && (
                                            <li>
                                                <Link to="/admin/dashboard">Dashboard</Link>
                                            </li>
                                        )}
                                        <div className="divider mt-0 mb-0"></div>
                                        <li>
                                            <a onClick={logoutHandler}>Logout</a>
                                        </li>
                                    </ul>
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

                    {/* Mobile Nav */}
                    <div className="lg:hidden flex items-center">
                        <label className="swap mr-2">
                            <input type="checkbox" onClick={handleThemeToggle} />
                            <SunIcon className={`fill-current w-6 h-6 ${currentTheme === 'dark' ? 'swap-on' : 'swap-off'}`} />
                            <MoonIcon className={`fill-current w-6 h-6 ${currentTheme === 'light' ? 'swap-on' : 'swap-off'}`} />
                        </label>
                        {loading ? (
                            <span className="ml-2">...</span>
                        ) : user ? (
                            <div className="flex items-center space-x-2 relative">
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
                                        {user.role === 'admin' && (
                                            <li>
                                                <Link to="/admin/dashboard">Dashboard</Link>
                                            </li>
                                        )}
                                        <div className="divider mt-0 mb-0"></div>
                                        <li>
                                            <a onClick={logoutHandler}>Logout</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            !isAuthPage && (
                                <div className="flex space-x-2">
                                    <Link to="/login" className="btn btn-outline btn-sm" style={{ color: '#df1f47', borderColor: '#df1f47' }}>
                                        Login
                                    </Link>
                                    <Link to="/register" className="btn btn-sm" style={{ backgroundColor: '#df1f47', color: 'white' }}>
                                        Sign Up
                                    </Link>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className={`lg:hidden fixed inset-0 z-40 bg-black bg-opacity-40`} onClick={() => setMobileMenuOpen(false)}>
                    <div
                        className={`absolute top-0 left-0 w-64 h-full bg-base-100 shadow-lg flex flex-col p-6 space-y-4`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center mb-6">
                            <img
                                src="https://res.cloudinary.com/dglawxazg/image/upload/v1741112980/image_2025-03-05_022855838-removebg-preview_thwgac.png"
                                alt="KNM Logo"
                                className="h-10 w-auto"
                            />
                            <span className="ml-2 text-lg font-bold">KNM</span>
                        </div>
                        {navLinks.map((item, idx) => (
                            <button
                                key={idx}
                                className="btn btn-ghost text-base font-medium justify-start"
                                style={{ color: '#df1f47' }}
                                onClick={() => handleNavigation(item.path)}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Header;