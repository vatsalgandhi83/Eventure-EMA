'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { User, Mail, Phone, BadgeCheck } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user || user.usertype !== 'Customer') {
      router.push('/login');
      return;
    }
    setProfile(user);
  }, [isAuthenticated, user, router]);

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
        </div>
      </main>
    </div>
  );
} 