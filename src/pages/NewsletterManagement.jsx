// src/components/NewsletterManagement.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Sidebar from '../componenets/Sidebar'; // Fixed spelling
import { XCircleIcon } from '@heroicons/react/24/solid';

const API_URL = 'https://farmferry-backend-n04p.onrender.com/api/newsletter/send'; // Updated URL

export default function NewsletterManagement() {
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState(null); // 'success' or 'error'

  // Auth redirection
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); 
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !token) {
      setMessage('Authentication required');
      setStatus('error');
      return;
    }

    setLoading(true);
    setMessage(null);
    setStatus(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (file) {
      formData.append('file', file);
    }
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        body: formData, 
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Newsletter sent to all subscribers!');
        setStatus('success');
        // Clear form after successful send
        setTitle('');
        setContent('');
        setFile(null);
      } else {
        setMessage(data.error || 'Failed to send newsletter.');
        setStatus('error');
      }
    } catch (err) {
      console.error("Send error:", err);
      setMessage('Network error. Could not send the newsletter.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl text-green-600 font-medium">
          Access Denied. Redirecting to Login...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50"> 
      <Sidebar /> 
      
      <main className="flex-1 px-4 py-6 sm:px-6 md:ml-64 transition-all duration-300"> 
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Send Newsletter</h1>

        <div className="max-w-3xl bg-white shadow-xl rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Subject / Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter newsletter subject"
              />
            </div>

            {/* Content Input */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                Content (HTML is allowed by the API)
              </label>
              <textarea
                id="content"
                rows="8"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={loading}
                placeholder="Write the main body of your newsletter here. Basic HTML formatting is supported."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              ></textarea>
            </div>
            
            {/* File Input */}
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                Optional Attachment (Image or Video)
              </label>
              <input
                type="file"
                id="file"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={loading}
                accept="image/*,video/*"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-green-700 hover:file:bg-blue-100 disabled:file:bg-gray-100 disabled:file:text-gray-400"
              />
              {file && (
                <div className="flex items-center text-sm text-gray-600 mt-2">
                  <span className="truncate max-w-xs">{file.name}</span>
                  <XCircleIcon 
                    className="w-5 h-5 ml-2 text-red-500 cursor-pointer hover:text-red-700" 
                    onClick={() => !loading && setFile(null)} 
                  />
                </div>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Supported formats: JPEG, PNG, GIF, WebP, MP4, MOV (Max: 5MB)
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !title || !content}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-gree-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Newsletter...
                </div>
              ) : (
                'Send Newsletter to All Subscribers'
              )}
            </button>
          </form>

          {/* Message Feedback */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg border ${
              status === 'success' 
                ? 'bg-green-50 text-green-800 border-green-200' 
                : 'bg-red-50 text-red-800 border-red-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {status === 'success' ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${status === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Newsletter Information</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>This newsletter will be sent to all subscribers in your database.</p>
                  <p className="mt-1">You can include images or videos as attachments.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main> 
    </div> 
  );
}