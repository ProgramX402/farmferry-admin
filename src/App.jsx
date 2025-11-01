import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Import Auth and Protection components
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";

// Import Pages
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BlogManagement from "./pages/BlogManagement";
import EventManagement from "./pages/EventManagement";
import ProjectManagement from "./pages/ProjectManagement";
import NewsletterManagement from "./pages/NewsletterManagement";
import SubscribeFrom from "./componenets/SubscribeForm";
import ContactForm from "./componenets/ContactForm";

export default function App() {
  return (
    // 1. Wrap the entire router with AuthProvider to provide global state
    <AuthProvider>
      <Router>
        <Routes>
          {/* ======================================= */}
          {/* 🔓 PUBLIC & AUTH ROUTES (Unprotected) 🔓 */}
          {/* ======================================= */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/subscribe" element={<SubscribeFrom />} />
          <Route path="/contact" element={<ContactForm />} />

          {/* ======================================= */}
          {/* 🔒 PROTECTED ROUTES (Requires Login) 🔒 */}
          {/* ======================================= */}
          <Route element={<ProtectedRoute />}>
            {/* Staff access only */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/blogs" element={<BlogManagement />} />
            <Route path="/events" element={<EventManagement />} />
            <Route path="/projects" element={<ProjectManagement />} />
            <Route path="/newsletter" element={<NewsletterManagement />} />
          </Route>
          
          {/* Catch-all for 404s */}
          <Route path="*" element={<div>404 Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
