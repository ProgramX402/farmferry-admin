import React from 'react';
import Sidebar from '../componenets/Sidebar'; 
import DashboardCard from '../componenets/DashboardCard'; 

// 📚 Icon Placeholders (Same as before)
const BookOpenIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m-3-4H9.293c-.71 0-1.4-.216-1.954-.619l-3.585-2.509a2.03 2.03 0 010-3.14l3.585-2.509C7.893 4.21 8.583 4 9.293 4H12m3 4v.75m-3-1v.75m3-1v.75m3-1v.75m-3-.75h.01M15 19.75v-13m-3 13v-13m-3 0v13"></path></svg>;
const EnvelopeIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-1 12H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2z"></path></svg>;
const CubeIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7L12 3 4 7m16 0l-4 4m4-4v12m-4 4L12 21 4 17m16 0L12 13m0 8V3"></path></svg>;
const CalendarIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h.01M16 11h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;

const dashboardLinks = [
  { title: 'Manage Blogs', icon: BookOpenIcon, link: '/blogs' },
  { title: 'Manage Newsletter', icon: EnvelopeIcon, link: '/newsletter' },
  { title: 'Manage Products', icon: CubeIcon, link: '/products' },
  { title: 'Manage Events', icon: CalendarIcon, link: '/events' },
];

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* 🚀 KEY CHANGE: We use px-4 (horizontal padding) and py-6 (vertical padding)
          and apply specific left padding (lg:pl-8) to keep it tight to the sidebar 
          while maintaining a comfortable right margin. */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:py-6 lg:pl-8 md:ml-64 transition-all duration-300">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
        
        {/* The grid still favors wider cards on smaller desktop screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardLinks.map((item) => (
            <DashboardCard 
              key={item.title} 
              title={item.title} 
              icon={item.icon} 
              link={item.link} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}