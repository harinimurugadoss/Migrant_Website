import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import api from '../utils/api';

const WorkerDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workerData, setWorkerData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch worker profile data
        const profileResponse = await api.get('/api/users/profile');
        setWorkerData(profileResponse.data);
        
        // Fetch worker documents
        const documentsResponse = await api.get('/api/documents');
        setDocuments(documentsResponse.data);
        
        // Fetch worker tasks
        const tasksResponse = await api.get('/api/tasks');
        setTasks(tasksResponse.data);
      } catch (error) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Dashboard data error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="animate-fade-in">
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError('')}
        />
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white rounded-xl p-6 mb-6">
        <div className="flex items-center">
          <div className="bg-white rounded-full p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome, {workerData?.name}</h1>
            <p className="text-primary-100">Worker ID: {workerData?.workerId}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-header">Profile Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Full Name:</span>
              <span className="font-medium">{workerData?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{workerData?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{workerData?.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Home State:</span>
              <span className="font-medium">{workerData?.homeState}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">District:</span>
              <span className="font-medium">{workerData?.district}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`badge ${workerData?.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                {workerData?.status === 'approved' ? 'Approved' : 'Pending'}
              </span>
            </div>
            <div className="pt-3">
              <Link to="/worker/profile" className="btn-primary w-full text-center block">
                Update Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Documents Card */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-header">Documents</h3>
          {documents.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {documents.map((doc) => (
                <li key={doc._id} className="py-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`badge ${doc.status === 'approved' ? 'badge-success' : doc.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No documents uploaded yet</p>
            </div>
          )}
          <div className="pt-3">
            <Link to="/worker/documents" className="btn-primary w-full text-center block">
              Manage Documents
            </Link>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-header">Assigned Tasks</h3>
          {tasks.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li key={task._id} className="py-3">
                  <div className="mb-1">
                    <span className="font-medium">{task.title}</span>
                    <span className={`ml-2 badge ${
                      task.status === 'completed' ? 'badge-success' : 
                      task.status === 'in-progress' ? 'badge-warning' : 
                      'badge-primary'
                    }`}>
                      {task.status === 'completed' ? 'Completed' : 
                       task.status === 'in-progress' ? 'In Progress' : 
                       'New'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500">No tasks assigned yet</p>
            </div>
          )}
          <div className="pt-3">
            <Link to="/worker/tasks" className="btn-primary w-full text-center block">
              View All Tasks
            </Link>
          </div>
        </div>
      </div>

      {/* Important Information Section */}
      <div className="dashboard-card mt-6">
        <h3 className="dashboard-card-header">Important Information</h3>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm leading-5 font-medium text-blue-800">Keep your ID safe</h3>
              <div className="mt-2 text-sm leading-5 text-blue-700">
                <p>Always carry your Worker ID card with you. It's required for accessing various government services and benefits.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm leading-5 font-medium text-yellow-800">Document Verification</h3>
              <div className="mt-2 text-sm leading-5 text-yellow-700">
                <p>Make sure all your documents are verified. Unverified documents may delay access to benefits and services.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
