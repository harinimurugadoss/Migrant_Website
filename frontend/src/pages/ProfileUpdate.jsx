import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import api from '../utils/api';

const ProfileUpdate = () => {
  const { currentUser } = useAuth();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/users/profile');
        const userData = response.data;
        
        // Set form values
        setValue('name', userData.name);
        setValue('email', userData.email);
        setValue('phone', userData.phone);
        setValue('aadhar', userData.aadhar);
        setValue('homeState', userData.homeState);
        setValue('district', userData.district);
        setValue('address', userData.address || '');
        setValue('skills', userData.skills?.join(', ') || '');
        setValue('education', userData.education || '');
        setValue('experience', userData.experience || '');
      } catch (error) {
        setAlert({
          show: true,
          type: 'error',
          message: 'Failed to load profile data. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [setValue]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      
      // Convert skills string to array
      const formattedData = {
        ...data,
        skills: data.skills.split(',').map(skill => skill.trim()).filter(skill => skill !== '')
      };
      
      await api.put('/api/users/profile', formattedData);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Profile updated successfully!'
      });
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/worker/dashboard');
      }, 2000);
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="card">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Update Your Profile</h2>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                className="form-input bg-gray-100"
                readOnly
                {...register('email')}
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
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
                className="form-input bg-gray-100"
                readOnly
                {...register('aadhar')}
              />
              <p className="text-xs text-gray-500 mt-1">Aadhar cannot be changed</p>
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

            <div className="md:col-span-2">
              <label htmlFor="address" className="form-label">Current Address</label>
              <textarea
                id="address"
                rows="3"
                className="form-input"
                placeholder="Enter your current address in Tamil Nadu"
                {...register('address')}
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="skills" className="form-label">Skills (comma-separated)</label>
              <input
                id="skills"
                type="text"
                className="form-input"
                placeholder="E.g., Construction, Plumbing, Carpentry"
                {...register('skills')}
              />
              <p className="text-xs text-gray-500 mt-1">List your skills separated by commas</p>
            </div>

            <div>
              <label htmlFor="education" className="form-label">Education</label>
              <select
                id="education"
                className="form-input"
                {...register('education')}
              >
                <option value="">Select education level</option>
                <option value="No formal education">No formal education</option>
                <option value="Primary education">Primary education</option>
                <option value="Secondary education">Secondary education</option>
                <option value="Higher secondary">Higher secondary</option>
                <option value="Vocational training">Vocational training</option>
                <option value="Diploma">Diploma</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>

            <div>
              <label htmlFor="experience" className="form-label">Work Experience (in years)</label>
              <input
                id="experience"
                type="number"
                min="0"
                className="form-input"
                placeholder="Years of experience"
                {...register('experience', {
                  min: {
                    value: 0,
                    message: 'Experience cannot be negative'
                  }
                })}
              />
              {errors.experience && <p className="form-error">{errors.experience.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate('/worker/dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? <LoadingSpinner size="small" color="white" /> : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdate;
