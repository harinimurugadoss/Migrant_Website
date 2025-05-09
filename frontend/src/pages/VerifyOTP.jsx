import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

const VerifyOTP = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  // Get email from session storage
  const email = sessionStorage.getItem('registrationEmail');

  useEffect(() => {
    // If no email in session storage, redirect to register page
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    // Countdown timer for resend OTP
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);
      
      await verifyOTP(email, data.otp);
      
      // Clear the session storage
      sessionStorage.removeItem('registrationEmail');
      
      // Show success message and navigate to login page
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setError('');
      setResendLoading(true);
      
      await resendOTP(email);
      
      // Start countdown for 60 seconds
      setCountdown(60);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="card">
        <div className="text-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-primary-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold">Verify Your Email</h2>
          <p className="text-gray-600 mt-2">
            We've sent a verification code to your email {email && <span className="font-semibold">{email}</span>}
          </p>
        </div>

        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')}
          />
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label htmlFor="otp" className="form-label">Verification Code</label>
            <input
              id="otp"
              type="text"
              className={`form-input text-center text-2xl tracking-widest ${errors.otp ? 'border-red-500' : ''}`}
              maxLength="6"
              placeholder="Enter 6-digit code"
              {...register('otp', { 
                required: 'Verification code is required',
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'OTP must be a 6-digit number'
                }
              })}
            />
            {errors.otp && <p className="form-error">{errors.otp.message}</p>}
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" color="white" /> : 'Verify Code'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-2">Didn't receive the code?</p>
          {countdown > 0 ? (
            <p className="text-sm text-gray-500">
              Resend code in {countdown} seconds
            </p>
          ) : (
            <button
              onClick={handleResendOTP}
              className="text-primary-600 hover:underline font-medium focus:outline-none"
              disabled={resendLoading}
            >
              {resendLoading ? <LoadingSpinner size="small" /> : 'Resend Code'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
