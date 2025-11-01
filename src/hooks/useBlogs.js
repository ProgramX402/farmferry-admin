// src/hooks/useBlogs.js
import { useState, useEffect } from 'react';

const API_BASE_URL = 'https://farmferry-backend-n04p.onrender.com/api';

export const useBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all blogs (public route)
  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/blogs`);
      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.status}`);
      }
      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
      console.error('Fetch blogs error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete blog (protected route)
  const deleteBlog = async (blogId, token) => {
    if (!token) {
      setError('Authentication token required');
      return false;
    }

    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete blog: ${response.status}`);
      }

      // Remove from local state
      setBlogs(prev => prev.filter(blog => blog._id !== blogId));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Delete blog error:', err);
      return false;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return {
    blogs,
    loading,
    error,
    deleteBlog,
    refetch: fetchBlogs,
    clearError,
  };
};