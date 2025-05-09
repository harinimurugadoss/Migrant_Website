import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register: registerUser, currentUser } = useAuth();
  const navigate = useNavigate();
  
  const password = watch('password');

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      
      // Call the register function from auth context
      const response = await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        aadhar: data.aadhar,
        homeState: data.homeState,
        district: data.district,
        password: data.password
      });
      
      // Store email in session storage for OTP verification
      sessionStorage.setItem('registrationEmail', data.email);
      
      // Navigate to OTP verification page
      navigate('/verify-otp');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="card">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Register as a Worker</h2>
          <p className="text-gray-600 mt-2">Create an account to access the Tamil Nadu Migrant Worker Portal</p>
        </div>

        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter your full name"
                {...register('name', { 
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
              />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Enter your email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="form-label">Phone Number</label>
              <input
                id="phone"
                type="tel"
                className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="Enter your phone number"
                {...register('phone', { 
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Invalid Indian phone number'
                  }
                })}
              />
              {errors.phone && <p className="form-error">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="aadhar" className="form-label">Aadhar Number</label>
              <input
                id="aadhar"
                type="text"
                className={`form-input ${errors.aadhar ? 'border-red-500' : ''}`}
                placeholder="Enter your 12-digit Aadhar number"
                {...register('aadhar', { 
                  required: 'Aadhar number is required',
                  pattern: {
                    value: /^\d{12}$/,
                    message: 'Aadhar number must be 12 digits'
                  }
                })}
              />
              {errors.aadhar && <p className="form-error">{errors.aadhar.message}</p>}
            </div>

            <div>
              <label htmlFor="homeState" className="form-label">Home State</label>
              <select
                id="homeState"
                className={`form-input ${errors.homeState ? 'border-red-500' : ''}`}
                {...register('homeState', { 
                  required: 'Home state is required'
                })}
              >
                <option value="">Select your home state</option>
                {indianStates.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              {errors.homeState && <p className="form-error">{errors.homeState.message}</p>}
            </div>

            <div>
              <label htmlFor="district" className="form-label">District</label>
              <input
                id="district"
                type="text"
                className={`form-input ${errors.district ? 'border-red-500' : ''}`}
                placeholder="Enter your district"
                {...register('district', { 
                  required: 'District is required'
                })}
              />
              {errors.district && <p className="form-error">{errors.district.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className={`form-input ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Create a password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                  }
                })}
              />
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Confirm your password"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
              />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="termsAccepted"
                type="checkbox"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                {...register('termsAccepted', { 
                  required: 'You must accept the terms and conditions'
                })}
              />
              <label htmlFor="termsAccepted" className="ml-2 text-sm text-gray-700">
                I agree to the <a href="#" className="text-primary-600 hover:underline">Terms and Conditions</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
              </label>
            </div>
            {errors.termsAccepted && <p className="form-error">{errors.termsAccepted.message}</p>}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" color="white" /> : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account? 
            <Link to="/login" className="text-primary-600 hover:underline ml-1">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
