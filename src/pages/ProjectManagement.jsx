// src/components/ProjectManagement.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects'; 
import { useAuth } from '../AuthContext';
import ProjectForm from '../componenets/ProjectForm'; // Fixed spelling
import Sidebar from '../componenets/Sidebar'; // Fixed spelling

export default function ProjectManagement() {
  const { projects, loading, error, saveProject, deleteProject, clearError } = useProjects();
  const { isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
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

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsFormOpen(true);
    setLocalError('');
    setSuccessMessage('');
  };

  const handleCreateNew = () => {
    setEditingProject(null);
    setIsFormOpen(true);
    setLocalError('');
    setSuccessMessage('');
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProject(null);
    setLocalError('');
  };
  
  const handleSave = async (formData, projectId) => {
    if (!isAuthenticated || !token) {
      setLocalError('Authentication required');
      return false;
    }

    setUploadLoading(true);
    setCurrentAction(projectId ? 'updating' : 'creating');
    setLocalError('');
    clearError();

    try {
      const success = await saveProject(formData, projectId);
      if (success) {
        setSuccessMessage(projectId ? 'Project updated successfully!' : 'Project created successfully!');
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

  const handleDelete = async (projectId) => {
    if (!isAuthenticated || !token) {
      setLocalError('Authentication required');
      return;
    }

    if (window.confirm('Are you sure you want to delete this project?')) {
      setCurrentAction('deleting');
      setLocalError('');
      clearError();

      const success = await deleteProject(projectId);
      if (success) {
        setSuccessMessage('Project deleted successfully!');
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Projects</h1>
          <button
            onClick={handleCreateNew}
            disabled={uploadLoading}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            {uploadLoading && currentAction === 'creating' ? 'Creating...' : '+ New Project'}
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="ml-2 text-teal-600">Loading projects...</span>
          </div>
        )}
        
        {uploadLoading && currentAction && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <p className="text-blue-700">
              {currentAction === 'creating' && 'Creating new project...'}
              {currentAction === 'updating' && 'Updating project...'}
              {currentAction === 'deleting' && 'Deleting project...'}
            </p>
          </div>
        )}
        
        {/* Show both local errors and hook errors */}
        {(localError || error) && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700">Error: {localError || error}</p>
          </div>
        )}
        
        {/* Project List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {projects.map((project) => (
              <li 
                key={project._id} 
                className="px-4 py-4 sm:px-6 hover:bg-gray-50 
                           flex flex-col sm:flex-row sm:justify-between sm:items-center"
              >
                {/* Content Area */}
                <div className="min-w-0 flex-1 order-1 sm:order-none">
                  <p className="text-lg font-medium text-gray-900">{project.title}</p>
                  
                  {/* Truncated content is hidden on smaller screens to save space, shown on sm: */}
                  <p className="text-sm text-gray-500 truncate mt-1 hidden sm:block">
                    {project.content?.substring(0, 100)}...
                  </p>
                  
                  <div className="mt-2 flex items-center space-x-4">
                    {project.mediaUrl && (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        project.mediaType === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {project.mediaType === 'video' ? '🎥 Video' : '🖼️ Image'}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons Area */}
                <div className="
                  ml-0 mt-4 sm:mt-0 sm:ml-4 flex-shrink-0 
                  space-x-3 w-full sm:w-auto 
                  flex justify-end order-2 sm:order-none
                ">
                  <button
                    onClick={() => handleEdit(project)}
                    disabled={uploadLoading}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    disabled={uploadLoading}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {projects.length === 0 && !loading && !localError && !error && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🚀</div>
              <p className="text-gray-500 text-lg">No projects published yet.</p>
              <p className="text-gray-400 text-sm mt-2">Create your first project to get started!</p>
            </div>
          )}
        </div>

        {/* Modal/Overlay for ProjectForm */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-start justify-center pt-10">
            <div className="relative bg-white rounded-lg p-6 w-full max-w-2xl mx-4 my-8 shadow-xl">
              <ProjectForm 
                onSubmit={handleSave} 
                initialData={editingProject} 
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