import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi'; // Chevron icon from react-icons

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header style={{ backgroundColor: '#A4161A' }} className="text-white">
      <div className="container mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <a href="/">KBituin</a>
        </div>
        
        {/* Navigation (optional, currently empty) */}
        <nav>
          <ul className="flex space-x-4">
            {/* Add navigation items here */}
          </ul>
        </nav>

        {/* User Profile with Dropdown */}
        <div className="relative">
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={toggleDropdown}
          >
            <img 
              src="https://via.placeholder.com/40" 
              alt="User Profile" 
              className="rounded-full w-10 h-10" 
            />
            <span className="font-medium">John Doe</span>
            <FiChevronDown className="text-xl" />
          </div>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
              <ul>
                <li className="px-4 py-2 hover:bg-gray-200">
                  <a href="/profile">Profile</a>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200">
                  <a href="/settings">Settings</a>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200">
                  <a href="/logout">Logout</a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
