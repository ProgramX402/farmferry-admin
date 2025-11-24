// src/components/BlogForm.jsx
import React, { useState, useEffect } from 'react';

const BlogForm = ({ onSubmit, initialData, onClose, loading = false, action = '' }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    file: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        content: initialData.content || '',
        file: null
      });
      if (initialData.mediaUrl) {
        setPreviewUrl(initialData.mediaUrl);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          file: 'File size must be less than 5MB'
        }));
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
      if (!validTypes.includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          file: 'Please select a valid image (JPEG, PNG, GIF, WebP) or video (MP4, MOV) file'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        file
      }));

      setFormErrors(prev => ({
        ...prev,
        file: ''
      }));

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else if (file.type.startsWith('video/')) {
        setPreviewUrl('video');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.content.trim()) errors.content = 'Content is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onSubmit(formData, initialData?._id);
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
    setPreviewUrl('');
    setFormErrors(prev => ({
      ...prev,
      file: ''
    }));
  };

  const getButtonText = () => {
    if (loading) {
      return action === 'updating' ? 'Updating...' : 'Creating...';
    }
    return initialData ? 'Update Blog' : 'Create Blog';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header with Title and Close Button */}
      <div className="flex justify-between items-start sm:items-center border-b border-gray-200 pb-4">
        {/* Added break-words to ensure the title wraps on smaller screens if it's too long */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words pr-4"> 
          {initialData ? 'Edit Blog' : 'Create New Blog'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl font-light bg-transparent border-none cursor-pointer p-1 -mt-1"
          disabled={loading}
          aria-label="Close form"
        >
          ×
        </button>
      </div>

      {/* Title Input */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          disabled={loading}
          className={`mt-1 block w-full border rounded-md shadow-sm p-3 text-sm ${
            formErrors.title 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
          } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          placeholder="Enter blog title"
        />
        {formErrors.title && (
          <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
        )}
      </div>

      {/* Content Textarea */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Content *
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
          rows="8"
          disabled={loading}
          className={`mt-1 block w-full border rounded-md shadow-sm p-3 text-sm ${
            formErrors.content 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-green-500 focus:ring-green-500'
          } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          placeholder="Write your blog content here..."
        />
        {formErrors.content && (
          <p className="mt-1 text-sm text-red-600">{formErrors.content}</p>
        )}
      </div>

      {/* Media Upload */}
      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
          Media Upload (Image/Video)
        </label>
        {/* Added file:py-1 and file:px-3 to make the button a bit smaller on mobile */}
        <input
          type="file"
          id="file"
          name="file"
          onChange={handleFileChange}
          accept="image/*,video/*"
          disabled={loading}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 sm:file:py-2 sm:file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:file:bg-gray-100 disabled:file:text-gray-400"
        />
        <p className="mt-1 text-sm text-gray-500">
          Supported formats: JPEG, PNG, GIF, WebP, MP4, MOV (Max: 5MB)
        </p>
        {formErrors.file && (
          <p className="mt-1 text-sm text-red-600">{formErrors.file}</p>
        )}
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
          {previewUrl === 'video' ? (
            <div className="flex items-center space-x-2">
              <span className="text-green-600 text-2xl">🎥</span>
              <span className="text-sm text-green-600 font-medium">Video file selected</span>
            </div>
          ) : previewUrl.startsWith('blob:') ? (
            // Ensure preview content is flexible
            <div className="flex items-center flex-wrap space-x-4"> 
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-20 h-20 object-cover rounded border flex-shrink-0"
              />
              <span className="text-sm text-gray-600 mt-2 sm:mt-0">New image selected</span>
            </div>
          ) : (
             // Ensure preview content is flexible
            <div className="flex items-center flex-wrap space-x-4">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-20 h-20 object-cover rounded border flex-shrink-0"
              />
              <span className="text-sm text-gray-600 mt-2 sm:mt-0">Current blog image</span>
            </div>
          )}
          <button
            type="button"
            onClick={removeFile}
            disabled={loading}
            className="mt-2 text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
          >
            Remove file
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {/* Changed flex-row-reverse to flex-col-reverse on mobile for stacked buttons, then flex-row-reverse on sm: */}
      <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          // Added w-full on mobile, then reverted on sm:
          className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          // Added w-full on mobile, then reverted on sm:
          className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
        >
          {getButtonText()}
        </button>
      </div>
    </form>
  );
};

export default BlogForm;