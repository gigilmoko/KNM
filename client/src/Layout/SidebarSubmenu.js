import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function SidebarSubmenu({ submenu, name, icon }) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Open submenu if current path matches any submenu path
  useEffect(() => {
    if (submenu.some(m => m.path === location.pathname)) setIsExpanded(true);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Route header */}
      <button
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer focus:outline-none"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className="flex items-center gap-2">
          {icon} <span className="font-semibold text-base md:text-lg">{name}</span>
        </span>
        <ChevronDownIcon
          className={
            'w-5 h-5 ml-2 transition-transform duration-300 ' +
            (isExpanded ? 'rotate-180' : '')
          }
        />
      </button>

      {/* Submenu list */}
      <div className={`w-full transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
        <ul className="menu menu-compact pl-4 md:pl-6">
          {submenu.map((m, k) => (
            <li key={k} className="relative">
              <Link
                to={m.path}
                className={`flex items-center gap-2 py-2 px-2 rounded-md transition text-sm md:text-base ${
                  location.pathname === m.path
                    ? 'bg-[#df1f47] text-white font-semibold'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {m.icon} {m.name}
                {location.pathname === m.path && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-tr-md rounded-br-md bg-primary"
                    aria-hidden="true"
                  ></span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SidebarSubmenu;