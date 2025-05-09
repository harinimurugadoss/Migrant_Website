import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();
  
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-xl text-white py-16 px-8 mb-12">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Tamil Nadu Migrant Worker Portal
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            A comprehensive platform to register, manage, and support migrant workers across Tamil Nadu
          </p>
          {!currentUser ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/register" 
                className="btn-primary text-lg px-8 py-3"
              >
                Register as a Worker
              </Link>
              <Link 
                to="/login" 
                className="btn bg-white text-primary-700 hover:bg-gray-100 focus:ring-primary-500 text-lg px-8 py-3"
              >
                Login to Account
              </Link>
            </div>
          ) : (
            <Link 
              to="/dashboard" 
              className="btn-primary text-lg px-8 py-3"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform provides essential tools and services to address migrant labor issues efficiently
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Unique Worker ID</h3>
            <p className="text-gray-600">
              Each worker receives a unique identification number that helps in tracking benefits and services
            </p>
          </div>

          <div className="card text-center">
            <div className="text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Document Management</h3>
            <p className="text-gray-600">
              Securely store and manage important documents like identification, work permits, and contracts
            </p>
          </div>

          <div className="card text-center">
            <div className="text-primary-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Task Assignment</h3>
            <p className="text-gray-600">
              Efficiently manage work assignments and track progress through our intuitive interface
            </p>
          </div>
        </div>
      </section>

      {/* Process Flow Section */}
      <section className="py-12 bg-gray-50 rounded-xl p-8 mb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A simple and streamlined process to get started with our platform
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center mb-8">
            <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4 md:mb-0 md:mr-6">1</div>
            <div className="md:flex-1">
              <h3 className="text-xl font-semibold mb-2">Register on the Portal</h3>
              <p className="text-gray-600">Complete the registration form with your personal and work details to create an account</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center mb-8">
            <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4 md:mb-0 md:mr-6">2</div>
            <div className="md:flex-1">
              <h3 className="text-xl font-semibold mb-2">Verify Your Email</h3>
              <p className="text-gray-600">Verify your account through the OTP sent to your email address</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center mb-8">
            <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4 md:mb-0 md:mr-6">3</div>
            <div className="md:flex-1">
              <h3 className="text-xl font-semibold mb-2">Receive Your Unique ID</h3>
              <p className="text-gray-600">Upon registration, you'll receive a unique worker ID for all future interactions</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center">
            <div className="bg-primary-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4 md:mb-0 md:mr-6">4</div>
            <div className="md:flex-1">
              <h3 className="text-xl font-semibold mb-2">Access Your Dashboard</h3>
              <p className="text-gray-600">Log in to your personalized dashboard to manage your profile, documents, and tasks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-secondary-700 text-white rounded-xl py-12 px-8 text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 text-white">Ready to Get Started?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Join thousands of migrant workers who have streamlined their work experience through our platform
        </p>
        {!currentUser ? (
          <Link 
            to="/register" 
            className="btn bg-white text-secondary-700 hover:bg-gray-100 focus:ring-white text-lg px-8 py-3"
          >
            Register Now
          </Link>
        ) : (
          <Link 
            to="/dashboard" 
            className="btn bg-white text-secondary-700 hover:bg-gray-100 focus:ring-white text-lg px-8 py-3"
          >
            Go to Dashboard
          </Link>
        )}
      </section>
    </div>
  );
};

export default Home;
