// frontend/src/app/manager/profile/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { User, Mail, Phone, BadgeCheck } from 'lucide-react';
import { BASE_URL } from '@/constants/constants';
export default function ManagerProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user || user.usertype !== 'Manager') {
      router.push('/login');
      return;
    }
    setProfile(user);
  }, [isAuthenticated, user, router]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <Navbar />
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="bg-white shadow-xl rounded-2xl p-12 w-full max-w-2xl mt-12">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-100 rounded-full p-4 mb-4">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {profile.firstName} {profile.lastName}
            </h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mt-2">
              <BadgeCheck className="h-4 w-4 mr-1 text-blue-500" />
              {profile.usertype}
            </span>
          </div>
          <div className="space-y-8">
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-400 mr-3" />
              <span className="font-medium text-gray-700 w-32">First Name:</span>
              <span className="text-gray-900">{profile.firstName}</span>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 text-blue-400 mr-3" />
              <span className="font-medium text-gray-700 w-32">Last Name:</span>
              <span className="text-gray-900">{profile.lastName}</span>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-blue-400 mr-3" />
              <span className="font-medium text-gray-700 w-32">Email:</span>
              <span className="text-gray-900">{profile.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-blue-400 mr-3" />
              <span className="font-medium text-gray-700 w-32">Phone Number:</span>
              <span className="text-gray-900">{profile.phoneNo}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}