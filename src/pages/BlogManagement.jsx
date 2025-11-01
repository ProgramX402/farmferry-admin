// src/components/BlogManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogs } from '../hooks/useBlogs'; 
import { useAuth } from '../AuthContext';
import BlogForm from '../componenets/BlogForm'
import Sidebar from '../componenets/Sidebar';

const API_BASE_URL = 'https://farmferry-backend-n04p.onrender.com/api';

export default function BlogManagement() {
  const { blogs, loading, error, deleteBlog, refetch, clearError } = useBlogs();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [localError, setLocalError] = useState(''); // Add local error state

  // Auth redirection
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); 
    }
  }, [isAuthenticated, navigate]);

  // Handle blog save (create or update) with file upload
  const handleSave = async (formData, blogId) => {
    if (!isAuthenticated || !token) {
      setLocalError('Authentication required');
      return false;
    }

    setUploadLoading(true);
    setCurrentAction(blogId ? 'updating' : 'creating');
    setLocalError(''); // Use localError instead of setError
    clearError(); // Clear any error from useBlogs hook
    
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      
      // Append file if present (for both create and update)
      if (formData.file) {
        submitData.append('file', formData.file);
      }

      const url = blogId ? `${API_BASE_URL}/blogs/${blogId}` : `${API_BASE_URL}/blogs`;
      const method = blogId ? 'PUT' : 'POST';

      console.log('Sending request to:', url, 'with token:', token ? 'present' : 'missing');

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: submitData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || `Failed to ${blogId ? 'update' : 'create'} blog`);
      }

      // Show success message
      setSuccessMessage(blogId ? 'Blog updated successfully!' : 'Blog created successfully!');
      
      // Refetch blogs to update the list
      await refetch();
      
      handleFormClose();
      return true;
    } catch (error) {
      console.error('Save blog error:', error);
      setLocalError(error.message); // Use localError instead of setError
      return false;
    } finally {
      setUploadLoading(false);
      setCurrentAction('');
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setIsFormOpen(true);
    setLocalError(''); // Use localError
    setSuccessMessage('');
  };

  const handleCreateNew = () => {
    setEditingBlog(null);
    setIsFormOpen(true);
    setLocalError(''); // Use localError instead of setError
    setSuccessMessage('');
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingBlog(null);
    setLocalError(''); // Use localError
  };

  const handleDelete = async (blogId) => {
    if (!isAuthenticated || !token) {
      setLocalError('Authentication required');
      return;
    }

    if (window.confirm('Are you sure you want to delete this blog?')) {
      setCurrentAction('deleting');
      setLocalError(''); // Use localError
      clearError(); // Clear any error from useBlogs hook
      
      const success = await deleteBlog(blogId, token);
      if (success) {
        setSuccessMessage('Blog deleted successfully!');
      }
      
      setCurrentAction('');
    }
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || localError || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setLocalError('');
        clearError();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, localError, error, clearError]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-indigo-600 font-medium">
          Access Denied. Redirecting to Login...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50"> 
      <Sidebar />
      
      <main className="flex-1 px-4 py-6 sm:px-6 md:ml-64 transition-all duration-300"> 
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Blogs</h1>
          <button
            onClick={handleCreateNew}
            disabled={uploadLoading}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {uploadLoading && currentAction === 'creating' ? 'Creating...' : '+ New Blog'}
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Loading and Error States */}
        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-indigo-600">Loading blogs...</span>
          </div>
        )}
        
        {uploadLoading && currentAction && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <p className="text-blue-700">
              {currentAction === 'creating' && 'Creating new blog...'}
              {currentAction === 'updating' && 'Updating blog...'}
              {currentAction === 'deleting' && 'Deleting blog...'}
            </p>
          </div>
        )}
        
        {/* Show both local errors and hook errors */}
        {(localError || error) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700">Error: {localError || error}</p>
          </div>
        )} 
        
        {/* Blog List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {blogs.map((blog) => (
              <li key={blog._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex justify-between items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-medium text-gray-900">{blog.title}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {blog.content?.substring(0, 100)}...
                  </p>
                  <div className="mt-2 flex items-center space-x-4">
                    {blog.mediaUrl && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        blog.mediaType === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {blog.mediaType === 'video' ? '🎥 Video' : '🖼️ Image'}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      Created: {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 space-x-3">
                  <button
                    onClick={() => handleEdit(blog)}
                    disabled={uploadLoading}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    disabled={uploadLoading}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {blogs.length === 0 && !loading && !localError && !error && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">No blogs published yet.</p>
              <p className="text-gray-400 text-sm mt-2">Create your first blog to get started!</p>
            </div>
          )}
        </div>

        {/* Modal/Overlay for BlogForm */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-10">
            <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl mx-4 my-8 shadow-xl">
              <BlogForm 
                onSubmit={handleSave} 
                initialData={editingBlog} 
                onClose={handleFormClose}
                loading={uploadLoading}
                action={currentAction}
              />
            </div>
          </div>
        )}
      </main> 
    </div>
  );
}