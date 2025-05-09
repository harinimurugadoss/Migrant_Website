import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProfileUpdate from './pages/ProfileUpdate';
import DocumentUpload from './pages/DocumentUpload';
import WorkerTasks from './pages/WorkerTasks';

function App() {
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          
          {/* Worker Routes */}
          <Route 
            path="/worker/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['worker']}>
                <WorkerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/worker/profile" 
            element={
              <ProtectedRoute allowedRoles={['worker']}>
                <ProfileUpdate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/worker/documents" 
            element={
              <ProtectedRoute allowedRoles={['worker']}>
                <DocumentUpload />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/worker/tasks" 
            element={
              <ProtectedRoute allowedRoles={['worker']}>
                <WorkerTasks />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect to appropriate dashboard if logged in */}
          <Route 
            path="/dashboard" 
            element={
              currentUser ? (
                currentUser.role === 'admin' ? 
                  <Navigate to="/admin/dashboard" replace /> : 
                  <Navigate to="/worker/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
