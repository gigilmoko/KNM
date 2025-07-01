import routes from './SidebarRoutes';
import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import SidebarSubmenu from './SidebarSubmenu';
import XMarkIcon from '@heroicons/react/24/outline/XMarkIcon';

function LeftSidebar() {
  const location = useLocation();
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'light');

  const close = () => {
    document.getElementById('left-sidebar-drawer').click();
  };

  useEffect(() => {
    const handleThemeChange = () => {
      const theme = localStorage.getItem('theme');
      setCurrentTheme(theme || 'light');
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  const logoSrc = currentTheme === 'dark' ? '/1.png' : '/1.png';

  return (
    <div className="drawer-side z-30">
      <label htmlFor="left-sidebar-drawer" className="drawer-overlay"></label>
      <ul className="menu pt-4 w-72 sm:w-80 bg-white dark:bg-gray-900 min-h-full text-base-content shadow-2xl transition-all duration-300">
        {/* Mobile close button */}
        <button
          className="btn btn-ghost bg-gray-100 dark:bg-gray-800 btn-circle z-50 top-3 right-3 absolute lg:hidden"
          onClick={close}
          aria-label="Close sidebar"
        >
          <XMarkIcon className="h-6 w-6 text-[#df1f47]" />
        </button>
        {/* Logo */}
        <li className="mb-4 flex items-center justify-center">
          <Link to={'/admin/dashboard'} className="flex items-center gap-3">
            <img className="mask mask-squircle w-14 h-14" src={logoSrc} alt="Logo" />
            <span className="font-bold text-2xl text-[#df1f47] tracking-wide">KNM</span>
          </Link>
        </li>
        {/* Navigation */}
        {routes.map((route, k) => (
          <li key={k} className="relative my-1">
            {route.submenu ? (
              <SidebarSubmenu {...route} />
            ) : (
              <NavLink
                end
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-base ${
                    isActive
                      ? 'bg-[#fff0f4] dark:bg-[#2a0d16] text-[#df1f47] font-semibold shadow'
                      : 'hover:bg-[#fff0f4] dark:hover:bg-[#2a0d16] hover:text-[#df1f47]'
                  }`
                }
              >
                {route.icon}
                <span>{route.name}</span>
                {location.pathname === route.path && (
                  <span
                    className="absolute inset-y-1 left-0 w-1 rounded-tr-md rounded-br-md bg-[#df1f47]"
                    aria-hidden="true"
                  ></span>
                )}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LeftSidebar;