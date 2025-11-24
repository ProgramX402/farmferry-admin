import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff, RefreshCw, LogOut, LayoutDashboard, Rss, Mail } from 'lucide-react'; 

// --- 1. Auth Context and Hook ---

// Using localStorage for simplicity in this single-file example. 
// In a real app, you might use more secure storage or simply rely on
// in-memory state and secure, HttpOnly cookies for tokens.

const AuthContext = createContext(null);

// Custom hook to use the Auth context
const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const isAuthenticated = !!token;
  const navigate = useNavigate();

  // Function to handle login (save token)
  const login = (newToken) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    // Navigation to dashboard is handled by the LoginPage component's useEffect
  };

  // Function to handle logout (clear token and redirect)
  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    // Redirect to login page after logout
    navigate('/login', { replace: true });
  };

  const contextValue = {
    isAuthenticated,
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};


// --- 2. SidebarItem Component (Dependency for Sidebar) ---

const SidebarItem = ({ icon: Icon, text, to, active, onClick }) => {
  const baseClasses = "flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ease-in-out";
  const activeClasses = "bg-blue-600 text-white shadow-md";
  const inactiveClasses = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  
  const finalClasses = active ? `${baseClasses} ${activeClasses}` : `${baseClasses} ${inactiveClasses}`;

  return (
    <button
      onClick={onClick}
      className={finalClasses}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{text}</span>
    </button>
  );
};

// --- 3. AdminSidebar Component (with Logout Logic) ---

const navLinks = [
  { text: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', key: 'dashboard' },
  { text: 'Blogs', icon: Rss, to: '/blogs', key: 'blogs' },
  { text: 'Newsletter', icon: Mail, to: '/newsletter', key: 'newsletter' },
];

function AdminSidebar({ currentPage, navigate }) {
  const { logout } = useAuth(); // IMPORTANT: Get logout function from context
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Function to close the sidebar on mobile (for the overlay)
  const closeSidebar = () => setIsOpen(false);

  // === LOGOUT LOGIC IMPLEMENTATION ===
  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // OPTIONAL: If your backend needs a logout endpoint (e.g., token revocation)
      // await axios.post("https://farmferry-backend-n04p.onrender.com/api/auth/logout");
      
      // Simulate network delay for good UX feedback
      await new Promise(resolve => setTimeout(resolve, 700)); 
      
      // Perform the actual logout action from AuthContext
      logout(); 

    } catch (error) {
      console.error("Logout failed (This is fine if token is cleared locally):", error);
      // Even if the API call fails, we proceed with local token clear for safety
      logout();
    } finally {
      setIsLoggingOut(false);
    }
  };
  // ===================================

  // Tailwind classes for responsiveness and styling
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 w-64 bg-white
    shadow-lg transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:static md:shadow-none md:border-r border-gray-200
    flex flex-col h-full
  `;

  return (
    <>
      {/* Mobile Menu Button (only visible on small screens) */}
      <button
        className="fixed top-4 left-4 z-40 p-2 rounded-xl bg-white shadow-lg md:hidden text-gray-700 hover:text-blue-600 transition"
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
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-wider">FarmFerry</h1>
          <p className="text-xs text-gray-500">Admin Panel</p>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex flex-col p-4 space-y-1 flex-grow overflow-y-auto">
          {navLinks.map((link) => (
            <SidebarItem
              key={link.key}
              icon={link.icon}
              text={link.text}
              to={link.to}
              active={currentPage === link.key}
              onClick={() => {
                navigate(link.to);
                closeSidebar();
              }}
            />
          ))}
        </nav>
        
        {/* Logout Link Section */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`
              flex items-center w-full px-4 py-2 text-sm font-medium rounded-lg 
              transition duration-150 ease-in-out shadow-lg transform hover:scale-[1.01]
              ${isLoggingOut 
                ? 'bg-red-200 text-red-700 cursor-not-allowed' 
                : 'text-white bg-red-500 hover:bg-red-600'}
            `}
            aria-label={isLoggingOut ? "Logging out..." : "Logout"}
          >
            {isLoggingOut ? (
              <>
                <RefreshCw size={16} className="animate-spin mr-3 text-white" />
                <span>Logging Out...</span>
              </>
            ) : (
              <>
                <LogOut size={20} className="mr-3" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

// --- 4. LoginPage Component ---

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.email || !form.password) {
      setMessage("Please fill in all fields");
      return;
    }

    setLoading(true);
    setMessage("");
    
    try {
      // NOTE: Mocking the API call since the external URL is not guaranteed to work
      console.log(`Attempting login for: ${form.email}`);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

      // Mock response logic
      if (form.email === "admin@test.com" && form.password === "password") {
        const mockToken = "mock_auth_token_" + Date.now();
        login(mockToken); // Use the context login function
        setMessage("Login successful! Redirecting...");
      } else {
        throw new Error("Invalid email or password");
      }
      
    } catch (err) {
      // Handle mock or real errors
      const errorMessage = err.message.includes('password') 
        ? err.message 
        : "Cannot connect to server. Check console for details.";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen justify-center items-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Welcome Back</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email (e.g., admin@test.com)"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
              required
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Password (e.g., password)"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition"
              required
              disabled={loading}
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 disabled:text-gray-300 p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !form.email || !form.password}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.01]"
          >
            {loading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {message && (
          <p className={`mt-4 text-center text-sm font-medium p-3 rounded-lg ${
            message.includes("successful") 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </p>
        )}
        <p className="mt-4 text-center text-xs text-gray-500">
          Hint: Use <strong>admin@test.com</strong> and <strong>password</strong>
        </p>
      </div>
    </div>
  );
}


// --- 5. Protected Route Layout ---

// Component to wrap the dashboard structure (Sidebar + Content)
function DashboardLayout() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Determine the current page based on the URL path
  const currentPage = window.location.pathname.split('/')[1] || 'dashboard';

  if (!isAuthenticated) {
    // If not authenticated, redirect to login. This handles the case 
    // where the token expires or is manually removed.
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans antialiased">
      <AdminSidebar currentPage={currentPage} navigate={navigate} />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet /> {/* Renders the specific dashboard page (Dashboard, Blogs, etc.) */}
        </div>
      </main>
    </div>
  );
}

// --- 6. Content Pages ---

const ContentPage = ({ title, description }) => (
  <div className="bg-white p-6 md:p-10 rounded-xl shadow-xl min-h-[80vh]">
    <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
    <p className="text-gray-600 text-lg">{description}</p>
    <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-lg">
      This page is protected. If you click 'Logout' in the sidebar, you will be redirected to the login screen.
    </div>
  </div>
);

const DashboardPage = () => <ContentPage 
  title="Admin Dashboard" 
  description="Welcome to the core administrative overview. View your metrics and recent activities here." 
/>;

const BlogsPage = () => <ContentPage 
  title="Manage Blog Content" 
  description="Create, edit, and publish your latest articles and manage comments." 
/>;

const NewsletterPage = () => <ContentPage 
  title="Newsletter Management" 
  description="Manage subscriber lists, design campaigns, and track open rates for your newsletters." 
/>;


// --- 7. Main Application Component ---

export default function App() {
  return (
    <Router>
      {/* AuthProvider must wrap the routes to use the useNavigate hook */}
      <AuthProvider> 
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes (nested under DashboardLayout) */}
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="blogs" element={<BlogsPage />} />
            <Route path="newsletter" element={<NewsletterPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} /> {/* Fallback for authenticated users */}
          </Route>

          {/* Fallback for unauthenticated users trying to access non-existent pages */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}