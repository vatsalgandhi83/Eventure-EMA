'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '@/lib/auth-context';
import { BASE_URL } from '@/constants/constants';
export default function TicketsPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const userId = searchParams.get('userId');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!bookingId || !userId || !token || !isAuthenticated) {
      router.push('/customer/events');
      return;
    }
    fetch(`${BASE_URL}/getBookingDetails?bookingId=${bookingId}&userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        setTickets(data.booking?.tickets || []);
        setLoading(false);
      });
  }, [bookingId, userId, token, isAuthenticated, router]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50"><Navbar /><div className="p-8">Loading tickets...</div></div>;
  }

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? tickets.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev === tickets.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Your Tickets</h1>
        {tickets.length > 0 && (
          <div className="flex items-center justify-center w-full">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full bg-white border shadow hover:bg-gray-100 mr-4"
              aria-label="Previous Ticket"
            >
              <span className="text-2xl">&#8592;</span>
            </button>
            <div className="border rounded-xl p-8 bg-white text-center shadow-lg flex flex-col items-center">
              <p className="mb-4 font-medium text-lg">Ticket {currentIdx + 1}</p>
              <QRCodeCanvas value={tickets[currentIdx].qrCodeValue} size={240} level="H" />
              <p className="mt-4 text-base text-gray-600">{tickets[currentIdx].ticketId}</p>
            </div>
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-white border shadow hover:bg-gray-100 ml-4"
              aria-label="Next Ticket"
            >
              <span className="text-2xl">&#8594;</span>
            </button>
          </div>
        )}
        {tickets.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {tickets.map((_, idx) => (
              <span
                key={idx}
                className={`inline-block w-3 h-3 rounded-full ${idx === currentIdx ? 'bg-indigo-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 