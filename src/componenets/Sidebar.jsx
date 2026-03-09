import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
import { 
  HiOutlineViewGrid, 
  HiOutlineDocumentText, 
  HiOutlineMail, 
  HiOutlineShoppingBag, 
  HiOutlineCalendar,
  HiOutlineLogout,
  HiMenuAlt2 
} from 'react-icons/hi';

const navLinks = [
  { text: 'Dashboard', icon: HiOutlineViewGrid, to: '/dashboard', active: true },
  { text: 'Blogs', icon: HiOutlineDocumentText, to: '/blogs' },
  { text: 'Newsletter', icon: HiOutlineMail, to: '/newsletter' },
  { text: 'Products', icon: HiOutlineShoppingBag, to: '/products' },
  { text: 'Orders', icon: HiOutlineCalendar, to: '/orders' }, // ✅ Orders link
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const closeSidebar = () => setIsOpen(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      localStorage.removeItem("authToken");
      console.log("Logout successful");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 w-64 bg-white
    shadow-lg transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:static md:shadow-none md:border-r border-gray-200
    flex flex-col
  `;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-40 p-2 rounded-md bg-white shadow md:hidden text-gray-600"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        <HiMenuAlt2 className="w-6 h-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside className={sidebarClasses}>
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Admin Panel</h1>
        </div>

        <nav className="flex flex-col p-4 space-y-1 flex-grow">
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

        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`
              flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl 
              transition-all duration-200
              ${isLoggingOut 
                ? 'bg-red-50 text-red-400 cursor-not-allowed' 
                : 'text-red-600 hover:bg-red-50 hover:text-red-700'}
            `}
          >
            {isLoggingOut ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Logging Out...</span>
              </>
            ) : (
              <>
                <HiOutlineLogout className="w-5 h-5 mr-3" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
