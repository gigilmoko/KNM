import React from 'react';

const Sidebar = () => {
  return (
    <div className="h-screen w-48 bg-[#A4161A] text-white fixed">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-right">Sidebar</h2>
      </div>
      <ul className="mt-4">
        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
          <a href="/" className="ml-auto block text-right">Dashboard</a>
        </li>
        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
          <a href="/profile" className="ml-auto block text-right">Profile</a>
        </li>
        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
          <a href="/settings" className="ml-auto block text-right">Settings</a>
        </li>
        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
          <a href="/notifications" className="ml-auto block text-right">Notifications</a>
        </li>
        <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">
          <a href="/logout" className="ml-auto block text-right">Logout</a>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;