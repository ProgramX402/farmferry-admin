import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, text, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const baseClasses = "flex items-center p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200 cursor-pointer";
  const activeClasses = isActive ? "bg-indigo-100 text-indigo-700 font-semibold" : "";

  return (
    <Link 
      to={to} 
      className={`${baseClasses} ${activeClasses}`}
      onClick={() => console.log('Navigating to:', to)} // Optional: for debugging
    >
      {Icon && <Icon className="w-5 h-5 mr-3" />}
      <span className="truncate">{text}</span>
    </Link>
  );
};

export default SidebarItem;