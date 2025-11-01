// src/components/ProjectForm.jsx

import React, { useState, useEffect } from 'react';

export default function ProjectForm({ onSubmit, initialData = null, onClose }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [file, setFile] = useState(null);
  
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setContent(initialData.content);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    
    if (file) {
      formData.append('file', file);
    }
    
    onSubmit(formData, initialData?._id);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-lg space-y-4">
      <h2 className="text-2xl font-semibold text-teal-700">
        {initialData ? 'Edit Project' : 'Create New Project'}
      </h2>
      
      {/* Title Input */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Project Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      {/* Content Input */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Project Content / Description</label>
        <textarea
          id="content"
          rows="4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-teal-500 focus:border-teal-500"
        ></textarea>
      </div>
      
      {/* File Input */}
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
          Featured Image/Video
          {initialData?.mediaUrl && (
             <span className="ml-2 text-xs text-gray-500">(Current media exists. Choose new file to replace.)</span>
          )}
        </label>
        <input
          type="file"
          id="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          {initialData ? 'Save Changes' : 'Publish Project'}
        </button>
      </div>
    </form>
  );
}