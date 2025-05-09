import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import api from '../utils/api';

const WorkerTasks = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/tasks');
        setTasks(response.data);
      } catch (error) {
        setError('Failed to load tasks. Please try again later.');
        console.error('Tasks fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleMarkInProgress = async (taskId) => {
    try {
      await api.put(`/api/tasks/${taskId}/status`, { status: 'in-progress' });
      
      // Update local state
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, status: 'in-progress' } : task
      ));
    } catch (error) {
      setError('Failed to update task status. Please try again.');
    }
  };

  const handleMarkComplete = async (taskId) => {
    try {
      await api.put(`/api/tasks/${taskId}/status`, { status: 'completed' });
      
      // Update local state
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, status: 'completed' } : task
      ));
    } catch (error) {
      setError('Failed to update task status. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter tasks based on selected filter
  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

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

      <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-white">Your Tasks</h1>
        <p className="text-primary-100">Track and manage your assigned tasks</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium ${filter === 'all' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setFilter('all')}
        >
          All Tasks
        </button>
        <button
          className={`py-2 px-4 font-medium ${filter === 'pending' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`py-2 px-4 font-medium ${filter === 'in-progress' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setFilter('in-progress')}
        >
          In Progress
        </button>
        <button
          className={`py-2 px-4 font-medium ${filter === 'completed' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="md:col-span-1">
          <div className="dashboard-card">
            <h3 className="dashboard-card-header">
              {filter === 'all' ? 'All Tasks' : 
               filter === 'pending' ? 'Pending Tasks' : 
               filter === 'in-progress' ? 'In Progress Tasks' : 
               'Completed Tasks'}
            </h3>
            
            {filteredTasks.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <li 
                    key={task._id} 
                    className={`py-3 px-2 cursor-pointer hover:bg-gray-50 ${activeTask && activeTask._id === task._id ? 'bg-gray-50' : ''}`}
                    onClick={() => setActiveTask(task)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500">Due: {formatDate(task.dueDate)}</p>
                      </div>
                      <span className={`badge ${
                        task.status === 'completed' ? 'badge-success' : 
                        task.status === 'in-progress' ? 'badge-warning' : 
                        'badge-primary'
                      }`}>
                        {task.status === 'in-progress' ? 'In Progress' : 
                         task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-gray-500">No {filter !== 'all' ? filter : ''} tasks found</p>
              </div>
            )}
          </div>
        </div>

        {/* Task Details */}
        <div className="md:col-span-2">
          {activeTask ? (
            <div className="dashboard-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{activeTask.title}</h3>
                <span className={`badge ${
                  activeTask.status === 'completed' ? 'badge-success' : 
                  activeTask.status === 'in-progress' ? 'badge-warning' : 
                  'badge-primary'
                }`}>
                  {activeTask.status === 'in-progress' ? 'In Progress' : 
                   activeTask.status.charAt(0).toUpperCase() + activeTask.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Assigned Date</p>
                  <p className="font-medium">{formatDate(activeTask.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{formatDate(activeTask.dueDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <p className="font-medium">{activeTask.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{activeTask.location || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="bg-gray-50 p-4 rounded-md">{activeTask.description}</p>
              </div>
              
              {activeTask.status !== 'completed' && (
                <div className="flex gap-3">
                  {activeTask.status === 'pending' && (
                    <button
                      className="btn-primary"
                      onClick={() => handleMarkInProgress(activeTask._id)}
                    >
                      Start Task
                    </button>
                  )}
                  
                  {activeTask.status === 'in-progress' && (
                    <button
                      className="btn-primary"
                      onClick={() => handleMarkComplete(activeTask._id)}
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="dashboard-card text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-xl font-medium mb-2">No Task Selected</h3>
              <p className="text-gray-500">Select a task from the list to view its details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerTasks;
