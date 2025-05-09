import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="bg-primary-700 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo and Site Name */}
          <Link to="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="text-xl font-bold">TN Migrant Worker Portal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-primary-200 transition duration-200">Home</Link>
            
            {currentUser ? (
              <>
                <Link to="/dashboard" className="hover:text-primary-200 transition duration-200">Dashboard</Link>
                
                {currentUser.role === 'worker' && (
                  <>
                    <Link to="/worker/profile" className="hover:text-primary-200 transition duration-200">Profile</Link>
                    <Link to="/worker/documents" className="hover:text-primary-200 transition duration-200">Documents</Link>
                    <Link to="/worker/tasks" className="hover:text-primary-200 transition duration-200">Tasks</Link>
                  </>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="bg-primary-600 hover:bg-primary-800 px-4 py-2 rounded-md transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary-200 transition duration-200">Login</Link>
                <Link 
                  to="/register" 
                  className="bg-primary-600 hover:bg-primary-800 px-4 py-2 rounded-md transition duration-200"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <Link to="/" className="block py-2 hover:text-primary-200 transition duration-200" onClick={() => setIsMenuOpen(false)}>Home</Link>
            
            {currentUser ? (
              <>
                <Link to="/dashboard" className="block py-2 hover:text-primary-200 transition duration-200" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                
                {currentUser.role === 'worker' && (
                  <>
                    <Link to="/worker/profile" className="block py-2 hover:text-primary-200 transition duration-200" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                    <Link to="/worker/documents" className="block py-2 hover:text-primary-200 transition duration-200" onClick={() => setIsMenuOpen(false)}>Documents</Link>
                    <Link to="/worker/tasks" className="block py-2 hover:text-primary-200 transition duration-200" onClick={() => setIsMenuOpen(false)}>Tasks</Link>
                  </>
                )}
                
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-2 hover:text-primary-200 transition duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 hover:text-primary-200 transition duration-200" onClick={() => setIsMenuOpen(false)}>Login</Link>
                <Link to="/register" className="block py-2 hover:text-primary-200 transition duration-200" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
