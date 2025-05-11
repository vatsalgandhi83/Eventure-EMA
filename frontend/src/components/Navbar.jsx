'use client';

import { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <button
          onClick={handleLogout}
          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      );
    }

    return (
      <>
        <Link
          href="/login"
          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
        >
          Signup
        </Link>
      </>
    );
  };

  const renderNavigationLinks = () => {
    if (!isAuthenticated) return null;

    if (user.usertype === 'Manager') {
      return (
        <div className="flex items-center space-x-4">
          <Link href="/manager/events" className="text-gray-600 hover:text-gray-900">
            My Events
          </Link>
          <Link href="/manager/profile" className="text-gray-600 hover:text-gray-900">
            Profile
          </Link>
        </div>
      );
    }

    // Default to Customer view
    return (
      <div className="flex items-center space-x-4">
        <Link href="/customer/tickets" className="text-gray-600 hover:text-gray-900">
          My Bookings
        </Link>
        <Link href="/customer/profile" className="text-gray-600 hover:text-gray-900">
          Profile
        </Link>
      </div>
    );
  };

  const renderMobileNavigationLinks = () => {
    if (!isAuthenticated) return null;

    if (user.usertype === 'Manager') {
      return (
        <>
          <Link
            href="/manager/events"
            className="block px-3 py-2 text-gray-600 hover:text-gray-900"
          >
            My Events
          </Link>
          <Link
            href="/manager/profile"
            className="block px-3 py-2 text-gray-600 hover:text-gray-900"
          >
            Profile
          </Link>
        </>
      );
    }

    // Default to Customer view
    return (
      <>
        <Link
          href="/customer/tickets"
          className="block px-3 py-2 text-gray-600 hover:text-gray-900"
        >
          My Tickets
        </Link>
        <Link
          href="/customer/profile"
          className="block px-3 py-2 text-gray-600 hover:text-gray-900"
        >
          Profile
        </Link>
      </>
    );
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href={isAuthenticated ? (user.usertype === 'Manager' ? '/manager/home' : '/customer/home') : '/'} 
              className="text-xl font-bold text-gray-800"
            >
              Eventure
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {renderNavigationLinks()}

            <div className="flex items-center space-x-4">
              {renderAuthButtons()}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-900"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderMobileNavigationLinks()}

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900 flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
                >
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
