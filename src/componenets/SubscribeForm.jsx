// src/components/SubscribeForm.jsx

import React, { useState } from 'react';

const API_URL = 'https://orphanage-backend-r7i2.onrender.com/api/newsletter/subscribe'; 

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState(null); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setStatus(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Thank you for subscribing!');
        setStatus('success');
        setEmail(''); // Clear the input on success
      } else {
        // Handle server errors (e.g., "Already subscribed" 409)
        setMessage(data.error || 'Subscription failed. Please try again.');
        setStatus('error');
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setMessage('Network error. Could not connect to the server.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-xl border border-gray-100">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Stay Updated!</h3>
      <p className="text-gray-600 mb-6">
        Get the latest updates, events, and projects delivered straight to your inbox.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          type="submit"
          disabled={!email}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          Subscribe
        </button>
      </form>

      {/* Message Feedback */}
      {message && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}