import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, text, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const baseClasses = "flex items-center p-3 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200 cursor-pointer";
  const activeClasses = isActive ? "bg-green-100 text-green-700 font-semibold" : "";

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