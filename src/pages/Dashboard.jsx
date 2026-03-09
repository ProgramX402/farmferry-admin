import React from 'react';
import Sidebar from '../componenets/Sidebar';
import DashboardCard from '../componenets/DashboardCard';
import { 
  HiOutlineDocumentText, 
  HiOutlineMail, 
  HiOutlineShoppingBag, 
  HiOutlineCalendar 
} from 'react-icons/hi';

const dashboardLinks = [
  { 
    title: 'Manage Blogs', 
    icon: HiOutlineDocumentText, 
    link: '/blogs',
    description: 'Create, edit and publish blog posts.'
  },
  { 
    title: 'Manage Newsletter', 
    icon: HiOutlineMail, 
    link: '/newsletter',
    description: 'Send updates to your subscribers.'
  },
  { 
    title: 'Manage Products', 
    icon: HiOutlineShoppingBag, 
    link: '/products',
    description: 'Update inventory, prices, and listings.'
  },
  { 
    title: 'Manage Orders', 
    icon: HiOutlineCalendar, 
    link: '/orders',
    description: 'View and process customer orders.'
  },
];

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:pl-10 md:ml-64 transition-all duration-300">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here is what's happening today.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {dashboardLinks.map((item) => (
            <DashboardCard 
              key={item.title} 
              title={item.title} 
              icon={item.icon} 
              link={item.link} 
              description={item.description}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
