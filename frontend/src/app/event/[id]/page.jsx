'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Calendar, MapPin, User, Plus, Minus, X, CheckCircle, AlertCircle, Ticket, ExternalLink, Clock, Info } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { BASE_URL } from '@/constants/constants';
export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token, user, isAuthenticated } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [userBooking, setUserBooking] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message, type = 'error') => {
    setToast({ show: true, message, type });
  };

  const fetchEventDetails = async () => {
    try {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      
      const response = await fetch(`${BASE_URL}/events/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }
      const data = await response.json();
      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, isAuthenticated]);



  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const handleTicketCountChange = (increment) => {
    const newCount = increment ? ticketCount + 1 : ticketCount - 1;
    if (newCount > 0 && newCount <= event.available_tickets) {
      setTicketCount(newCount);
    }
  };

  const createPayPalPayment = async (amount) => {
    const response = await fetch(`${BASE_URL}/events/create-payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: amount.toFixed(2) }), // amount as string
    });

    const data = await response.json();
    if (data.status === 'success') {
      return data.approvalUrl;
    } else {
      throw new Error(data.message || 'Failed to initiate payment');
    }
  };

  const handleConfirmTicket = async () => {
    try {
      if (!isAuthenticated) {
        showToast('Please login to book tickets', 'error');
        router.push('/login');
        return;
      }

      if (ticketCount > event.available_tickets) {
        showToast(`Only ${event.available_tickets} tickets available`, 'error');
        return;
      }

      setIsBooking(true);
      const totalTicketPrice = ticketCount * event.ticketPrice;

      // If ticket price is zero, directly book the tickets
      if (totalTicketPrice === 0) {
        const response = await fetch(`${BASE_URL}/bookEvent`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            eventId: id,
            ticketCount,
            ticketPrice: event.ticketPrice,
            totalTicketPrice,
            paymentStatus: true,
          }),
        });

        if (response.ok) {
          showToast(`Successfully booked ${ticketCount} ticket${ticketCount > 1 ? 's' : ''} for ${event.eventName}!`, 'success');
          setShowConfirmModal(false);
          router.push(`/event/${id}?status=success`);
        } else {
          const error = await response.json();
          showToast(error.message || 'Failed to book tickets', 'error');
        }
        return;
      }

      // For paid tickets, proceed with PayPal payment
      const approvalUrl = await createPayPalPayment(totalTicketPrice);

      // Save booking intent info in localStorage
      localStorage.setItem('bookingDetails', JSON.stringify({
        userId: user.id,
        eventId: id,
        ticketCount,
        ticketPrice: event.ticketPrice,
        totalTicketPrice,
        paymentStatus: true,
      }));

      // Redirect to PayPal
      window.location.href = approvalUrl;

    } catch (error) {
      console.error('Payment initiation error:', error);
      showToast(error.message, 'error');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!userBooking) return;

    try {
      setIsCancelling(true);
      const response = await fetch(`${BASE_URL}/cancelBooking`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: userBooking.bookingId,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Booking cancelled successfully', 'success');
        // Refresh event data and user booking
        await Promise.all([fetchEventDetails(), fetchUserBooking()]);
      } else {
        const errorMessage = data.message || data.error || 'Failed to cancel booking. Please try again.';
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      showToast('An error occurred while cancelling the booking. Please try again.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const getGoogleMapsUrl = (latitude, longitude) => {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  };

  const getGoogleMapsEmbedUrl = (latitude, longitude) => {
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${latitude},${longitude}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-red-600">Error: {error || 'Event not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navbar />
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center p-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <p>{toast.message}</p>
            <button
              onClick={() => setToast(prev => ({ ...prev, show: false }))}
              className="ml-4"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Confirm Booking</h3>
            <p className="text-gray-600 mb-6">
              Confirm booking of {ticketCount} ticket(s) for a total of ${(ticketCount * event.ticketPrice).toFixed(2)}?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                disabled={isBooking}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTicket}
                disabled={isBooking}
                className={`px-4 py-2 rounded-lg text-white font-medium ${
                  isBooking
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                }`}
              >
                {isBooking ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main>
        {/* Full Width Image */}
        <div className="w-full h-[500px] relative">
          {event?.eventImageBase64 ? (
            <img
              src={event.eventImageBase64}
              alt={event.eventName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getPlaceholderImage(event.eventCategory);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <span className="text-gray-600 text-lg">{event?.eventName}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-8">
              {/* Event Title and Description */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{event?.eventName}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">{event?.desc}</p>
              </div>

              {/* Grid Layout for Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="flex items-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                    <Calendar className="h-6 w-6 text-indigo-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="text-gray-900 font-medium">{formatDate(event?.eventDateTime)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                    <MapPin className="h-6 w-6 text-indigo-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-gray-900 font-medium">{event?.address}</p>
                      <p className="text-gray-600">{event?.city}, {event?.state} {event?.zipCode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                    <User className="h-6 w-6 text-indigo-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Available Tickets</p>
                      <p className="text-gray-900 font-medium">{event?.available_tickets} of {event?.eventCapacity} tickets remaining</p>
                    </div>
                  </div>

                  {event?.eventCategory && event.eventCategory !== 'null' && (
                    <div className="p-4 bg-indigo-50/80 backdrop-blur-sm rounded-xl border border-indigo-100">
                      <div className="flex items-center mb-2">
                        <Info className="h-5 w-5 text-indigo-600 mr-2" />
                        <h3 className="font-semibold text-indigo-800">Event Category</h3>
                      </div>
                      <p className="text-indigo-600">{event.eventCategory}</p>
                    </div>
                  )}

                  {event?.eventInstruction && event.eventInstruction !== 'null' && (
                    <div className="p-4 bg-indigo-50/80 backdrop-blur-sm rounded-xl border border-indigo-100">
                      <div className="flex items-center mb-2">
                        <Info className="h-5 w-5 text-indigo-600 mr-2" />
                        <h3 className="font-semibold text-indigo-800">Event Instructions</h3>
                      </div>
                      <p className="text-indigo-600">{event.eventInstruction}</p>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Google Maps Embed */}
                  {event?.location?.latitude && event.location?.longitude && (
                    <div className="space-y-3">
                      <div 
                        className="h-[300px] rounded-xl overflow-hidden shadow-lg border border-gray-100 relative cursor-pointer hover:shadow-xl transition-shadow duration-200"
                        onClick={() => window.open(getGoogleMapsUrl(event.location.latitude, event.location.longitude), '_blank')}
                      >
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={getGoogleMapsEmbedUrl(event.location.latitude, event.location.longitude)}
                          allowFullScreen
                        />
                      </div>
                      <a 
                        href={getGoogleMapsUrl(event.location.latitude, event.location.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in Google Maps
                      </a>
                    </div>
                  )}

                  {/* Ticket Booking Section */}
                  {!userBooking ? (
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-sm text-gray-500">Price per ticket</p>
                          <span className="text-3xl font-bold text-gray-900">${event?.ticketPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-4 bg-gray-50/80 backdrop-blur-sm p-2 rounded-lg border border-gray-100">
                          <button
                            onClick={() => handleTicketCountChange(false)}
                            className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            disabled={ticketCount <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-lg font-semibold w-8 text-center">{ticketCount}</span>
                          <button
                            onClick={() => handleTicketCountChange(true)}
                            className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            disabled={ticketCount >= event?.available_tickets}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isBooking || event?.available_tickets === 0}
                        className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-200 ${
                          isBooking || event?.available_tickets === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                        }`}
                      >
                        {isBooking ? 'Processing...' : event?.available_tickets === 0 ? 'Sold Out' : 'Book Tickets'}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-green-50/80 backdrop-blur-sm p-6 rounded-xl border border-green-100 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-green-800 text-lg">Booking Confirmed</h3>
                          <p className="text-green-600">You have booked {userBooking.ticketCount} ticket(s)</p>
                        </div>
                        <button
                          onClick={handleCancelBooking}
                          disabled={isCancelling}
                          className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                            isCancelling
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                          }`}
                        >
                          {isCancelling ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                              Cancelling...
                            </>
                          ) : (
                            'Cancel Booking'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper function to get placeholder image based on event category
const getPlaceholderImage = (category) => {
  const categoryLower = category?.toLowerCase() || '';
  if (categoryLower.includes('tech') || categoryLower.includes('workshop')) {
    return 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=500&auto=format&fit=crop&q=60';
  } else if (categoryLower.includes('comedy')) {
    return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&auto=format&fit=crop&q=60';
  } else {
    return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&auto=format&fit=crop&q=60';
  }
}; 