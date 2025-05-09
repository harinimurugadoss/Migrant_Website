import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import api from '../utils/api';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workers, setWorkers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    totalWorkers: 0,
    pendingApprovals: 0,
    documentsToReview: 0
  });
  const [selectedTab, setSelectedTab] = useState('workers');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch workers
        const workersResponse = await api.get('/api/admin/workers');
        setWorkers(workersResponse.data);
        
        // Fetch documents
        const documentsResponse = await api.get('/api/admin/documents');
        setDocuments(documentsResponse.data);
        
        // Calculate stats
        setStats({
          totalWorkers: workersResponse.data.length,
          pendingApprovals: workersResponse.data.filter(worker => worker.status === 'pending').length,
          documentsToReview: documentsResponse.data.filter(doc => doc.status === 'pending').length
        });
      } catch (error) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Admin dashboard data error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApproveWorker = async (workerId) => {
    try {
      await api.put(`/api/admin/workers/${workerId}/approve`);
      
      // Update local state
      setWorkers(workers.map(worker => 
        worker._id === workerId ? { ...worker, status: 'approved' } : worker
      ));
      
      // Update stats
      setStats({
        ...stats,
        pendingApprovals: stats.pendingApprovals - 1
      });
    } catch (error) {
      setError('Failed to approve worker. Please try again.');
    }
  };

  const handleRejectWorker = async (workerId) => {
    try {
      await api.put(`/api/admin/workers/${workerId}/reject`);
      
      // Update local state
      setWorkers(workers.map(worker => 
        worker._id === workerId ? { ...worker, status: 'rejected' } : worker
      ));
      
      // Update stats
      setStats({
        ...stats,
        pendingApprovals: stats.pendingApprovals - 1
      });
    } catch (error) {
      setError('Failed to reject worker. Please try again.');
    }
  };

  const handleApproveDocument = async (docId) => {
    try {
      await api.put(`/api/admin/documents/${docId}/approve`);
      
      // Update local state
      setDocuments(documents.map(doc => 
        doc._id === docId ? { ...doc, status: 'approved' } : doc
      ));
      
      // Update stats
      setStats({
        ...stats,
        documentsToReview: stats.documentsToReview - 1
      });
    } catch (error) {
      setError('Failed to approve document. Please try again.');
    }
  };

  const handleRejectDocument = async (docId) => {
    try {
      await api.put(`/api/admin/documents/${docId}/reject`);
      
      // Update local state
      setDocuments(documents.map(doc => 
        doc._id === docId ? { ...doc, status: 'rejected' } : doc
      ));
      
      // Update stats
      setStats({
        ...stats,
        documentsToReview: stats.documentsToReview - 1
      });
    } catch (error) {
      setError('Failed to reject document. Please try again.');
    }
  };

  // Filter workers based on status and search term
  const filteredWorkers = workers.filter(worker => {
    const matchesStatus = filterStatus === 'all' || worker.status === filterStatus;
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          worker.workerId.includes(searchTerm) ||
                          worker.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filter documents based on status and search term
  const filteredDocuments = documents.filter(doc => {
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.user.workerId.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

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

      {/* Admin Header */}
      <div className="bg-gradient-to-r from-secondary-700 to-secondary-900 text-white rounded-xl p-6 mb-6">
        <div className="flex items-center">
          <div className="bg-white rounded-full p-3 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-secondary-100">Manage migrant workers and documents</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="dashboard-card text-center">
          <div className="text-4xl font-bold text-primary-600 mb-2">{stats.totalWorkers}</div>
          <div className="text-gray-500">Total Workers</div>
        </div>
        
        <div className="dashboard-card text-center">
          <div className="text-4xl font-bold text-yellow-500 mb-2">{stats.pendingApprovals}</div>
          <div className="text-gray-500">Pending Approvals</div>
        </div>
        
        <div className="dashboard-card text-center">
          <div className="text-4xl font-bold text-blue-500 mb-2">{stats.documentsToReview}</div>
          <div className="text-gray-500">Documents to Review</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <ul className="flex -mb-px">
          <li className="mr-1">
            <button
              className={`inline-block py-2 px-4 font-medium ${
                selectedTab === 'workers'
                  ? 'text-secondary-600 border-b-2 border-secondary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedTab('workers')}
            >
              Workers
            </button>
          </li>
          <li className="mr-1">
            <button
              className={`inline-block py-2 px-4 font-medium ${
                selectedTab === 'documents'
                  ? 'text-secondary-600 border-b-2 border-secondary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedTab('documents')}
            >
              Documents
            </button>
          </li>
        </ul>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            className="form-input pl-10"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex items-center">
          <label className="mr-2 text-gray-700">Status:</label>
          <select
            className="form-input w-40"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Workers Tab Content */}
      {selectedTab === 'workers' && (
        <div className="overflow-x-auto dashboard-card p-0">
          {filteredWorkers.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Home State</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkers.map((worker) => (
                  <tr key={worker._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{worker.workerId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{worker.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{worker.email}</div>
                      <div>{worker.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{worker.homeState}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        worker.status === 'approved' ? 'badge-success' : 
                        worker.status === 'rejected' ? 'badge-danger' : 
                        'badge-warning'
                      }`}>
                        {worker.status.charAt(0).toUpperCase() + worker.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {worker.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleApproveWorker(worker._id)}
                          >
                            Approve
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleRejectWorker(worker._id)}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500">No workers found matching your criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Documents Tab Content */}
      {selectedTab === 'documents' && (
        <div className="overflow-x-auto dashboard-card p-0">
          {filteredDocuments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((doc) => (
                  <tr key={doc._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{doc.user.name}</div>
                      <div className="text-xs text-gray-400">ID: {doc.user.workerId}</div>
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
                        
                        {doc.status === 'pending' && (
                          <>
                            <button
                              className="text-green-600 hover:text-green-900"
                              onClick={() => handleApproveDocument(doc._id)}
                            >
                              Approve
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleRejectDocument(doc._id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No documents found matching your criteria</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
