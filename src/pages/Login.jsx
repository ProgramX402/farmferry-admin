import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Eye, EyeOff, RefreshCw } from "lucide-react"; 
import { useAuth } from "../AuthContext"; 

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
      const res = await axios.post(
        "https://farmferry-backend-n04p.onrender.com/api/auth/login", 
        form,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      if (res.status === 200 && res.data.token) {
        login(res.data.token); 
        setMessage("Login successful! Redirecting...");
        
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1000);
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;
        
        if (status === 500) {
          setMessage("Server error. Please try again later.");
        } else if (status === 401) {
          setMessage(errorData.error || "Invalid email or password");
        } else {
          setMessage(errorData.error || "Login failed");
        }
      } else if (err.code === 'ECONNABORTED') {
        setMessage("Request timeout. Please try again.");
      } else {
        setMessage("Cannot connect to server.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <div className="mb-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={loading}
          />
        </div>

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={loading}
            minLength={6}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:text-gray-300"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !form.email || !form.password}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>

        {message && (
          <p className={`mt-3 text-center text-sm ${
            message.includes("successful") ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}