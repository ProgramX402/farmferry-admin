import React from 'react';
import { Link } from 'react-router-dom';

const DashboardCard = ({ title, icon: Icon, link }) => {
  return (
    <Link
      to={link}
      className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 transform border-b-4 px-8 border-green-500 cursor-pointer text-center"
    >
      <div className="p-3 bg-indigo-100 rounded-full mb-4">
        {Icon && <Icon className="w-8 h-8 text-green-600" />}
      </div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">Go to management area</p>
    </Link>
  );
};

export default DashboardCard;