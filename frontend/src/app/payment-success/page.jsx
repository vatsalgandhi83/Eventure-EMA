'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();

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

        if (response.ok) {
          localStorage.removeItem('bookingDetails');
          router.push(`/event/${details.eventId}?status=success`);
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