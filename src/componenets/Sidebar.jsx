import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
// You would replace these with actual imports from an icon library
const DashboardIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7-4h14"></path></svg>;
const BlogsIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m-3-4H9.293c-.71 0-1.4-.216-1.954-.619l-3.585-2.509a2.03 2.03 0 010-3.14l3.585-2.509C7.893 4.21 8.583 4 9.293 4H12m3 4v.75m-3-1v.75m3-1v.75m3-1v.75m-3-.75h.01M15 19.75v-13m-3 13v-13m-3 0v13"></path></svg>;
const NewsletterIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664L12 3l7.11 4.407a2 2 0 01.89 1.664V19M21 19H3"></path></svg>;
const EventsIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h.01M16 11h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>;
const ProjectsIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;

const navLinks = [
  { text: 'Dashboard', icon: DashboardIcon, to: '/dashboard', active: true },
  { text: 'Blogs', icon: BlogsIcon, to: '/blogs' },
  { text: 'Newsletter', icon: NewsletterIcon, to: '/newsletter' },
  { text: 'Events', icon: EventsIcon, to: '/events' },
  { text: 'Projects', icon: ProjectsIcon, to: '/projects' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  // Function to close the sidebar on mobile (for the overlay)
  const closeSidebar = () => setIsOpen(false);

  // Tailwind classes for responsiveness and styling
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 w-64 bg-white
    shadow-lg transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:static md:shadow-none md:border-r border-gray-200
  `;

  return (
    <>
      {/* Mobile Menu Button (only visible on small screens) */}
      <button
        className="fixed top-4 left-4 z-40 p-2 rounded-md bg-white shadow md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
        </svg>
      </button>

      {/* Backdrop (Mobile Only, closes the sidebar when clicked outside) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Content */}
      <aside className={sidebarClasses}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin</h1>
        </div>
        <nav className="flex flex-col p-4 space-y-2">
          {navLinks.map((link) => (
            <SidebarItem
              key={link.text}
              icon={link.icon}
              text={link.text}
              to={link.to}
              active={link.active}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}