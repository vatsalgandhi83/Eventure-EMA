'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Calendar, MapPin, Ticket, DollarSign, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import TicketModal from '@/components/TicketModal';

export default function CustomerEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedQRBooking, setSelectedQRBooking] = useState(null);
  const [qrTickets, setQRTickets] = useState([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchEvents();
  }, [isAuthenticated, user]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://localhost:9000/api/events/byUser?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (bookingId) => {
    setSelectedBooking(bookingId);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch('http://localhost:9000/api/cancelBooking', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: selectedBooking,
          userId: user.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Update the UI after successful cancellation
      setEvents(events.filter(event => event.booking.id !== selectedBooking));
      setShowCancelModal(false);
      setSelectedBooking(null);
      setToast('Booking cancelled successfully!');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleViewTickets = async (bookingId, userId) => {
    try {
      console.log('Fetching tickets for booking:', bookingId, 'userId:', userId);
      const response = await fetch(`http://localhost:9000/api/getBookingDetails?bookingId=${bookingId}&userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error:', errorData);
        throw new Error(`Failed to fetch ticket details: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Received ticket data:', data);

      if (!data.booking?.tickets || !Array.isArray(data.booking.tickets)) {
        throw new Error('Invalid ticket data received from server');
      }

      // Check if tickets have QR codes
      const ticketsWithQR = data.booking.tickets.map(ticket => {
        if (!ticket.qrCodeImageBase64) {
          console.warn('Ticket missing QR code:', ticket);
        }
        return ticket;
      });

      setSelectedQRBooking(bookingId);
      setQRTickets(ticketsWithQR);
      setShowQRModal(true);
    } catch (err) {
      console.error('Error in handleViewTickets:', err);
      alert(err.message);
    }
  };

  const EventCard = ({ event }) => {
    if (!event || !event.event || !event.booking) {
      return null;
    }

    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-4 relative">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-medium text-gray-900 mb-2">{event.event.eventName}</h2>
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                {formatDate(event.event.eventDateTime)} at {event.event.eventDateTime.split('T')[1].substring(0, 5)}
              </div>
              <div className="mt-2">
                <div className="text-sm text-gray-500 mb-2">Tickets:</div>
                <div className="space-y-2">
                  {event.booking.tickets.map((ticket, index) => (
                    <div key={ticket.ticketId} className="text-sm text-gray-600">
                      Ticket {index + 1}: {ticket.ticketId} - ${ticket.ticketPrice}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => router.push(`/customer/tickets?bookingId=${event.booking.id}&userId=${event.booking.userId}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View Tickets
                </button>
                <button
                  onClick={() => handleCancel(event.booking.id)}
                  className="ml-4 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">Loading events...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-red-600">Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {events.length > 0 ? (
          events
            .filter(event => event.booking && event.booking.id)
            .map(event => (
              <EventCard key={event.booking.id} event={event} />
            ))
        ) : (
          <p className="text-gray-500">No events found</p>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            onClick={() => setShowCancelModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative"
              onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowCancelModal(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cancel Booking</h3>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  Are you sure you want to cancel this booking? This action cannot be undone.
                </p>
                <div className="flex w-full gap-3">
                  <button
                    type="button"
                    className="flex-1 inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setShowCancelModal(false)}
                  >
                    Keep Booking
                  </button>
                  <button
                    type="button"
                    className="flex-1 inline-flex justify-center items-center gap-2 rounded-md border border-transparent px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed"
                    onClick={confirmCancel}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Booking'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Modal */}
        <TicketModal
          visible={showQRModal}
          onClose={() => setShowQRModal(false)}
          tickets={qrTickets}
        />

        {toast && (
          <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
            {toast}
          </div>
        )}
      </main>
    </div>
  );
}
