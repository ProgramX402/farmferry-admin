// src/hooks/useEvents.js

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';

const API_BASE_URL = 'https://farmferry-backend-n04p.onrender.com/api/events';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // --- READ (Fetch all events) ---
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // --- CREATE / UPDATE ---
  const saveEvent = async (formData, eventId = null) => {
    if (!token) {
      setError('Authentication required');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const method = eventId ? 'PUT' : 'POST';
      const url = eventId ? `${API_BASE_URL}/${eventId}` : API_BASE_URL;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        body: formData, 
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${method === 'POST' ? 'create' : 'update'} event`);
      }

      await fetchEvents(); 
      return data.event;

    } catch (err) {
      setError(err.message);
      console.error("Save error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ---
  const deleteEvent = async (eventId) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete event');
      }

      // Optimistic update
      setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));

    } catch (err) {
      setError(err.message);
      console.error("Delete error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return { 
    events, 
    loading, 
    error, 
    fetchEvents, 
    saveEvent, 
    deleteEvent,
    clearError 
  };
};