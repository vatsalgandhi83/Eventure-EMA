'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { CheckCircle, X } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // const showToast = (message, type = 'success') => {
  //   setToast({ show: true, message, type });
  // };

  useEffect(() => {
    const finalizeBooking = async () => {
      try {
        const details = JSON.parse(localStorage.getItem('bookingDetails') || '{}');
        if (!details.userId || !details.eventId) {
          router.push('/?status=error');
          return;
        }

        const response = await fetch('http://localhost:9000/api/bookEvent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...details,
            paymentStatus: true
          }),
        });

        if (response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('bookingDetails');
          router.push('/login');
          return;
        }

        if (response) {
          // showToast('Tickets booked successfully!');

          localStorage.removeItem('bookingDetails');

          router.push(`/event/${details.eventId}?status=success`);
          alert('Tickets booked successfully!');

        } else {
          const error = await response.json();
          console.error('Booking finalization error:', error);
          router.push(`/event/${details.eventId}?status=failed`);
        }
      } catch (error) {
        console.error('Error finalizing booking:', error);
        router.push('/?status=error');
      }
    };

    finalizeBooking();
  }, [router, searchParams, token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`flex items-center p-4 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex-shrink-0">
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <X className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className={`ml-3 text-sm font-medium ${
              toast.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {toast.message}
            </div>
            <button
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="ml-4 flex-shrink-0"
            >
              <X className={`h-4 w-4 ${
                toast.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`} />
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Processing your booking...</h2>
          <p className="text-gray-600">Please wait while we confirm your payment and complete your booking.</p>
        </div>
      </div>
    </div>
  );
} 