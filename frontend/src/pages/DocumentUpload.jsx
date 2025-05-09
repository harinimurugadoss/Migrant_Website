import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import api from '../utils/api';

const DocumentUpload = () => {
  const { currentUser } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/documents');
        setDocuments(response.data);
      } catch (error) {
        setAlert({
          show: true,
          type: 'error',
          message: 'Failed to load documents. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const onSubmit = async (data) => {
    if (!data.file || !data.file[0]) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please select a file to upload'
      });
      return;
    }

    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('type', data.type);
      formData.append('file', data.file[0]);
      
      await api.post('/api/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Refresh the document list
      const response = await api.get('/api/documents');
      setDocuments(response.data);
      
      // Reset form
      reset();
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Document uploaded successfully! It will be reviewed by an admin.'
      });
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Failed to upload document. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/api/documents/${id}`);
      
      // Update local state
      setDocuments(documents.filter(doc => doc._id !== id));
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Document deleted successfully!'
      });
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Failed to delete document. Please try again.'
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Document Management</h2>
          <div className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600">
            Worker ID: {currentUser?.workerId}
          </div>
        </div>

        {alert.show && (
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ ...alert, show: false })}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="form-label">Document Name</label>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="E.g., Aadhar Card, Voter ID"
                {...register('name', { 
                  required: 'Document name is required' 
                })}
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="type" className="form-label">Document Type</label>
              <select
                id="type"
                className={`form-input ${errors.type ? 'border-red-500' : ''}`}
                {...register('type', { 
                  required: 'Document type is required' 
                })}
              >
                <option value="">Select document type</option>
                <option value="identity">Identity Proof</option>
                <option value="address">Address Proof</option>
                <option value="education">Education Certificate</option>
                <option value="employment">Employment Certificate</option>
                <option value="skill">Skill Certificate</option>
                <option value="other">Other</option>
              </select>
              {errors.type && <p className="form-error">{errors.type.message}</p>}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="file" className="form-label">Upload File</label>
            <div className={`border-2 border-dashed rounded-md p-4 text-center ${errors.file ? 'border-red-500' : 'border-gray-300'}`}>
              <input
                id="file"
                type="file"
                className="hidden"
                {...register('file', { 
                  required: 'Please select a file to upload' 
                })}
              />
              <label htmlFor="file" className="block cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-gray-600">Click to browse files or drag and drop</span>
                <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Supported formats: PDF, JPG, PNG</p>
              </label>
            </div>
            {errors.file && <p className="form-error">{errors.file.message}</p>}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading}
            >
              {uploading ? <LoadingSpinner size="small" color="white" /> : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Your Documents</h3>
        
        {documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        doc.status === 'approved' ? 'badge-success' : 
                        doc.status === 'rejected' ? 'badge-danger' : 
                        'badge-warning'
                      }`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                        >
                          View
                        </button>
                        {doc.status !== 'approved' && (
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteDocument(doc._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 mb-4">You haven't uploaded any documents yet</p>
            <p className="text-gray-600">Upload important documents like your ID proof, address proof, and work certificates</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload;
