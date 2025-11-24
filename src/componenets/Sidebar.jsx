import React, { useState } from 'react';
import SidebarItem from './SidebarItem';

// You would replace these with actual imports from an icon library
const DashboardIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7-4h14"></path></svg>;
const BlogsIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m-3-4H9.293c-.71 0-1.4-.216-1.954-.619l-3.585-2.509a2.03 2.03 0 010-3.14l3.585-2.509C7.893 4.21 8.583 4 9.293 4H12m3 4v.75m-3-1v.75m3-1v.75m3-1v.75m-3-.75h.01M15 19.75v-13m-3 13v-13m-3 0v13"></path></svg>;
const NewsletterIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664L12 3l7.11 4.407a2 2 0 01.89 1.664V19M21 19H3"></path></svg>;
const LogoutIcon = (props) => <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3v-3m3-11v11"></path></svg>; // Icon for Logout

const navLinks = [
  { text: 'Dashboard', icon: DashboardIcon, to: '/dashboard', active: true },
  { text: 'Blogs', icon: BlogsIcon, to: '/blogs' },
  { text: 'Newsletter', icon: NewsletterIcon, to: '/newsletter' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // State for loading indicator

  // Function to close the sidebar on mobile (for the overlay)
  const closeSidebar = () => setIsOpen(false);

  // === LOGOUT LOGIC ===
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    // 1. Simulate an API call or asynchronous task for logging out
    console.log("Starting logout process...");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate 1.5 second network delay
    console.log("Logout successful.");
    
    // 2. Perform actual logout actions:
    //    - Clear user tokens (e.g., localStorage.removeItem('token'))
    //    - Clear user state (e.g., dispatch(logoutUser()))
    //    - Redirect the user to the login page (e.g., router.push('/login'))
    
    // For this example, we'll just set the loading state back to false
    // and ideally, the page navigation would happen here.
    setIsLoggingOut(false);
    
    // Example redirection (if using Next.js/React Router, adjust accordingly):
    // window.location.href = '/login';
  };
  // ====================

  // Tailwind classes for responsiveness and styling
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 w-64 bg-white
    shadow-lg transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:static md:shadow-none md:border-r border-gray-200
    flex flex-col
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
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900">Admin</h1>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex flex-col p-4 space-y-2 flex-grow">
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
        
        {/* Logout Link Section */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`
              flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg 
              transition duration-150 ease-in-out 
              ${isLoggingOut 
                ? 'bg-red-200 text-red-700 cursor-not-allowed' 
                : 'text-red-600 hover:bg-red-50 hover:text-red-700'}
            `}
            aria-label={isLoggingOut ? "Logging out..." : "Logout"}
          >
            {isLoggingOut ? (
              <>
                {/* Simple Tailwind spinner */}
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Logging Out...</span>
              </>
            ) : (
              <>
                <LogoutIcon className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}