'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { User, Mail, Phone, BadgeCheck } from 'lucide-react';
import { BASE_URL } from '@/constants/constants';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNo: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user || user.usertype !== 'Customer') {
      router.push('/login');
      return;
    }
    setProfile(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNo: user.phoneNo,
      password: ''
    });
  }, [isAuthenticated, user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const updatedUser = await updateUser(user.id, {
        ...formData,
        usertype: user.usertype
      });
      setProfile(updatedUser);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-12 w-full max-w-2xl mt-12 border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          
          <div className="flex flex-col items-center mb-8">
            <div className="bg-indigo-100 rounded-full p-4 mb-4">
              <User className="h-10 w-10 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {profile.firstName} {profile.lastName}
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mt-2">
              <BadgeCheck className="h-4 w-4 mr-1 text-indigo-500" />
              {profile.usertype}
            </span>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNo"
                    value={formData.phoneNo}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div> */}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-8">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-indigo-400 mr-3" />
                  <span className="font-medium text-gray-700 w-32">First Name:</span>
                  <span className="text-gray-900">{profile.firstName}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-indigo-400 mr-3" />
                  <span className="font-medium text-gray-700 w-32">Last Name:</span>
                  <span className="text-gray-900">{profile.lastName}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-indigo-400 mr-3" />
                  <span className="font-medium text-gray-700 w-32">Email:</span>
                  <span className="text-gray-900">{profile.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-indigo-400 mr-3" />
                  <span className="font-medium text-gray-700 w-32">Phone Number:</span>
                  <span className="text-gray-900">{profile.phoneNo}</span>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit Profile
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
} 