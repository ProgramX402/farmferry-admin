// src/components/EventManagement.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../hooks/useEvents';
import { useAuth } from '../AuthContext';
import EventForm from '../componenets/EventForm'; // Fixed spelling
import Sidebar from '../componenets/Sidebar'; // Fixed spelling

export default function EventManagement() {
  const { events, loading, error, saveEvent, deleteEvent, clearError } = useEvents();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [localError, setLocalError] = useState('');

  // Auth redirection
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login'); 
    }
  }, [isAuthenticated, navigate]);

  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
    setLocalError('');
    setSuccessMessage('');
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    setIsFormOpen(true);
    setLocalError('');
    setSuccessMessage('');
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
    setLocalError('');
  };
  
  const handleSave = async (formData, eventId) => {
    if (!isAuthenticated || !token) {
      setLocalError('Authentication required');
      return false;
    }

    setUploadLoading(true);
    setCurrentAction(eventId ? 'updating' : 'creating');
    setLocalError('');
    clearError();

    try {
      const success = await saveEvent(formData, eventId);
      if (success) {
        setSuccessMessage(eventId ? 'Event updated successfully!' : 'Event created successfully!');
        handleFormClose();
        return true;
      }
      return false;
    } catch (err) {
      setLocalError(err.message);
      return false;
    } finally {
      setUploadLoading(false);
      setCurrentAction('');
    }
  };

  const handleDelete = async (eventId) => {
    if (!isAuthenticated || !token) {
      setLocalError('Authentication required');
      return;
    }

    if (window.confirm('Are you sure you want to delete this event?')) {
      setCurrentAction('deleting');
      setLocalError('');
      clearError();

      const success = await deleteEvent(eventId);
      if (success) {
        setSuccessMessage('Event deleted successfully!');
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

  // Helper to format date for display
  const formatDate = (isoDate) => {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
          <button
            onClick={handleCreateNew}
            disabled={uploadLoading}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {uploadLoading && currentAction === 'creating' ? 'Creating...' : '+ New Event'}
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-green-600">Loading events...</span>
          </div>
        )}
        
        {uploadLoading && currentAction && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <p className="text-green-700">
              {currentAction === 'creating' && 'Creating new event...'}
              {currentAction === 'updating' && 'Updating event...'}
              {currentAction === 'deleting' && 'Deleting event...'}
            </p>
          </div>
        )}
        
        {/* Show both local errors and hook errors */}
        {(localError || error) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700">Error: {localError || error}</p>
          </div>
        )}
        
        {/* Event List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {events.map((event) => (
              <li key={event._id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex justify-between items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-gray-600">When:</span> {formatDate(event.date)} 
                    <span className="mx-2 text-gray-400">|</span> 
                    <span className="font-semibold text-gray-600">Where:</span> {event.location}
                  </p>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {event.description?.substring(0, 100)}...
                  </p>
                  <div className="mt-2 flex items-center space-x-4">
                    {event.mediaUrl && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        event.mediaType === 'video' ? 'bg-green-100 text-green-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {event.mediaType === 'video' ? '🎥 Video' : '🖼️ Image'}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      Created: {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 space-x-3">
                  <button
                    onClick={() => handleEdit(event)}
                    disabled={uploadLoading}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    disabled={uploadLoading}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {events.length === 0 && !loading && !localError && !error && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <p className="text-gray-500 text-lg">No events scheduled yet.</p>
              <p className="text-gray-400 text-sm mt-2">Create your first event to get started!</p>
            </div>
          )}
        </div>

        {/* Modal/Overlay for EventForm */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-10">
            <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl mx-4 my-8 shadow-xl">
              <EventForm 
                onSubmit={handleSave} 
                initialData={editingEvent} 
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