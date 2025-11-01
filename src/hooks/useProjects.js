// src/hooks/useProjects.js

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';

const API_BASE_URL = 'https://farmferry-backend-n04p.onrender.com/api/projects'; 

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  // --- READ (Fetch all projects) ---
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // --- CREATE / UPDATE (Save) ---
  const saveProject = async (formData, projectId = null) => {
    if (!token) {
      setError('Authentication required');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const method = projectId ? 'PUT' : 'POST';
      const url = projectId ? `${API_BASE_URL}/${projectId}` : API_BASE_URL;

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
        throw new Error(data.error || `Failed to ${method === 'POST' ? 'create' : 'update'} project`);
      }

      await fetchProjects(); 
      return data.project;

    } catch (err) {
      setError(err.message);
      console.error("Save error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE ---
  const deleteProject = async (projectId) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete project');
      }

      // Optimistic update
      setProjects(prevProjects => prevProjects.filter(project => project._id !== projectId));

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
    projects, 
    loading, 
    error, 
    fetchProjects, 
    saveProject, 
    deleteProject,
    clearError 
  };
};