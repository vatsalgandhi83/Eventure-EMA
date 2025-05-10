'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Calendar, MapPin, User, Plus, Minus, X, CheckCircle, AlertCircle, Ticket } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

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
      
      const response = await fetch(`http://localhost:9000/api/events/${id}`, {
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

  const fetchUserBooking = async () => {
    try {
      if (!user?.id) return;

      const response = await fetch(`http://localhost:9000/api/bookings/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const bookings = await response.json();
        // Find booking for current event
        const currentEventBooking = bookings.find(booking => booking.event.id === id);
        setUserBooking(currentEventBooking);
      }
    } catch (error) {
      console.error('Error fetching user booking:', error);
    }
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (event) {
      fetchUserBooking();
    }
  }, [event]);

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

  const handleConfirmTicket = async () => {
    try {
      if (!isAuthenticated) {
        showToast('Please login to book tickets', 'error');
        router.push('/login');
        return;
      }

      // Validate ticket count
      if (ticketCount > event.available_tickets) {
        showToast(`Only ${event.available_tickets} tickets available`, 'error');
        return;
      }

      setIsBooking(true);
      const totalTicketPrice = ticketCount * event.ticketPrice;
      
      const response = await fetch('http://localhost:9000/api/bookings/createBooking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          eventId: id,
          ticketCount,
          ticketPrice: event.ticketPrice,
          totalTicketPrice,
          paymentStatus: true
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`Booking confirmed! Your booking ID is ${data.bookingId}`, 'success');
        // Refresh event data to update available tickets
        await fetchEventDetails();
        // Reset ticket count
        setTicketCount(1);
      } else {
        const errorMessage = data.message || data.error || 'Failed to book tickets. Please try again.';
        showToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Booking error:', error);
      showToast('An error occurred while booking tickets. Please try again.', 'error');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!userBooking) return;

    try {
      setIsCancelling(true);
      const response = await fetch('http://localhost:9000/api/cancelBooking', {
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
    <div className="min-h-screen bg-gray-50">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Image */}
          <div className="lg:col-span-2">
            <img
              src={event.eventImage || '/placeholder-event.jpg'}
              alt={event.eventName}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          
          {/* Event Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{event.eventName}</h1>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">
                  {formatDate(event.eventDateTime)}
                </span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">
                  {event.address}
                </span>
              </div>
              
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                <span className="text-gray-700">Event ID: {event.id}</span>
              </div>
            </div>
            
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold text-gray-900">About this event</h2>
              <p className="text-gray-700">{event.desc}</p>
            </div>
            
            {/* Additional Event Details */}
            <div className="space-y-4">
              {event.eventCategory && (
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full inline-block">
                  {event.eventCategory}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Event Capacity</p>
                  <p className="text-lg font-semibold">{event.eventCapacity}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Available Tickets</p>
                  <p className="text-lg font-semibold">{event.available_tickets}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Current Attendees</p>
                  <p className="text-lg font-semibold">{event.eventAttendees}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Ticket Price</p>
                  <p className="text-lg font-semibold">${event.ticketPrice}</p>
                </div>
              </div>
              
              {event.eventInstruction && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">Event Instructions</h3>
                  <p className="text-gray-700">{event.eventInstruction}</p>
                </div>
              )}
              
              {event.location?.gmapUrl && (
                <div className="mt-4">
                  <a 
                    href={event.location.gmapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                    View on Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Ticket Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Tickets</h2>
            
            {userBooking ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Ticket className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-900">Your Booking</h3>
                  </div>
                  <div className="space-y-2">
                    <p className="text-blue-800">
                      <span className="font-medium">Booking ID:</span> {userBooking.bookingId}
                    </p>
                    <p className="text-blue-800">
                      <span className="font-medium">Tickets:</span> {userBooking.ticketCount}
                    </p>
                    <p className="text-blue-800">
                      <span className="font-medium">Total Paid:</span> ${userBooking.totalTicketPrice}
                    </p>
                    <p className="text-blue-800">
                      <span className="font-medium">Status:</span>{' '}
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        userBooking.bookingStatus === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {userBooking.bookingStatus}
                      </span>
                    </p>
                  </div>
                </div>

                {userBooking.bookingStatus === 'CONFIRMED' && (
                  <button
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCancelling ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cancelling...
                      </span>
                    ) : (
                      'Cancel Booking'
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Number of tickets</span>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleTicketCountChange(false)}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={ticketCount <= 1 || isBooking}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-semibold">{ticketCount}</span>
                    <button
                      onClick={() => handleTicketCountChange(true)}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={ticketCount >= event.available_tickets || isBooking}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Price per ticket</span>
                    <span className="font-semibold">${event.ticketPrice}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-700">Total</span>
                    <span className="font-semibold">${(event.ticketPrice * ticketCount).toFixed(2)}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleConfirmTicket}
                  disabled={event.available_tickets === 0 || isBooking}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : event.available_tickets === 0 ? (
                    'Sold Out'
                  ) : (
                    'Reserve Spot'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 