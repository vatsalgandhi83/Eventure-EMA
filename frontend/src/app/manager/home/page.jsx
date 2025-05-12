'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Calendar, MapPin, Ticket, DollarSign, Edit, Trash2, Image as ImageIcon, Clock, X, Users, CheckCircle, AlertCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function ManagerHomePage() {
  const { user, token, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    eventName: '',
    desc: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    eventCapacity: '',
    ticketPrice: '',
    eventImageBase64: ''
  });
  const [eventDate, setEventDate] = useState(null);
  const [eventTime, setEventTime] = useState('');
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const timeDropdownRef = useRef(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Generate time slots
  const timeSlots = Array.from({ length: 24 * 4 }, (_, i) => {
    const hour = Math.floor(i / 4);
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
        setShowTimeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTimeSelect = (time) => {
    setEventTime(time);
    setShowTimeDropdown(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.usertype !== 'Manager') {
      router.push('/customer/home');
    } else {
      fetchEvents();
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    // Check for status and message in URL parameters
    const status = searchParams.get('status');
    const message = searchParams.get('message');

    if (status && message) {
      setToast({ show: true, message, type: status });
      // Remove the query parameters from URL
      router.replace('/manager/home');
      // Hide toast after 5 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: '' });
      }, 5000);
    }
  }, [searchParams]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://localhost:9000/api/events/byorganizer?organizerId=${user.id}`, {
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

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:9000/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      fetchEvents();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error.message);
    }
  };

  const getStatusColor = (availableTickets, totalCapacity) => {
    if (availableTickets === 0) {
      return 'bg-red-100 text-red-800';
    } else if (availableTickets < totalCapacity * 0.2) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setFormData(prev => ({
          ...prev,
          eventImageBase64: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFileName('');
    setPreviewUrl('');
    fileInputRef.current.value = '';
    setFormData(prev => ({
      ...prev,
      eventImageBase64: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let eventDateTime = '';
    if (eventDate && eventTime) {
      const dateStr = eventDate.toISOString().split('T')[0];
      eventDateTime = `${dateStr}T${eventTime}`;
    }

    try {
      const response = await fetch('http://localhost:9000/api/events/createEvent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          eventDateTime,
          organizerId: user.id
        })
      });

      if (!response.ok) {
        let errorMsg = 'Failed to create event';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || JSON.stringify(errorData) || errorMsg;
        } catch {
          // fallback to default error
        }
        throw new Error(errorMsg);
      }

      // Reset form
      setFormData({
        eventName: '',
        desc: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        eventCapacity: '',
        ticketPrice: '',
        eventImageBase64: ''
      });
      setEventDate(null);
      setEventTime('');
      setSelectedFileName('');
      setPreviewUrl('');
      fileInputRef.current.value = '';

      // Refresh events list
      fetchEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 animate-slide-up ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-3xl blur-3xl -z-10"></div>
          <div className="relative">
            <p className="text-lg text-gray-700">
              Welcome, <span className="font-semibold text-blue-600">{user?.firstName}</span>! Create and manage your events here.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Create Event Form */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
              <p className="mt-1 text-sm text-gray-500">Fill in the details below to create your event</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                  <input
                    type="text"
                    name="eventName"
                    id="eventName"
                    value={formData.eventName}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="desc"
                    id="desc"
                    value={formData.desc}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows="4"
                    placeholder="Describe your event"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter street address"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="City"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      id="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="State"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="ZIP"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details Section */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="eventCapacity" className="block text-sm font-medium text-gray-700 mb-1">Event Capacity</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="eventCapacity"
                      id="eventCapacity"
                      value={formData.eventCapacity}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter capacity"
                      required
                      min="1"
                    />
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700 mb-1">Ticket Price</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="ticketPrice"
                      id="ticketPrice"
                      value={formData.ticketPrice}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter price"
                      required
                      min="0"
                      step="0.01"
                    />
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                  <div className="relative">
                    <DatePicker
                      selected={eventDate}
                      onChange={date => setEventDate(date)}
                      dateFormat="MM/dd/yyyy"
                      placeholderText="Select date"
                      className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      calendarClassName="!z-50 rounded-xl border border-blue-200 shadow-lg p-2"
                      minDate={new Date()}
                      required
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={eventTime}
                      onChange={e => setEventTime(e.target.value)}
                      className="block w-full border border-gray-300 rounded-lg shadow-sm p-2.5 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                      required
                    />
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Select the time when your event will start</p>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Image</h3>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <ImageIcon className="h-5 w-5 mr-2" />
                      {selectedFileName ? 'Change Image' : 'Upload Image'}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                    <span className="text-gray-600 text-sm truncate max-w-xs">
                      {selectedFileName ? selectedFileName : 'No file selected'}
                    </span>
                    {selectedFileName && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Upload a high-quality image for your event (max 5MB)</p>
                </div>
                {previewUrl && (
                  <div className="md:ml-6">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Event...
                  </>
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Events List */}
        {/* <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Events</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">List of all events you've created</p>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading events...</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {events.length > 0 ? (
                events.map((event) => (
                  <li key={event.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h2 className="text-xl font-semibold text-gray-900">{event.eventName}</h2>
                          <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.available_tickets, event.eventCapacity)}`}>
                            {event.available_tickets === 0 ? 'Sold Out' : `${event.available_tickets} tickets left`}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-600">{event.desc}</p>
                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {new Date(event.eventDateTime).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {event.city}, {event.state}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Ticket className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            {event.eventCapacity} capacity
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <DollarSign className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            ${event.ticketPrice}
                          </div>
                        </div>
                      </div>
                      <div className="ml-6 flex-shrink-0 flex space-x-3">
                        <Link
                          href={`/manager/events-edit/${event.id}`}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedEvent(event.id);
                            setShowDeleteModal(true);
                          }}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-6 text-center text-gray-500">
                  No events created yet. Fill out the form above to create your first event!
                </li>
              )}
            </ul>
          )}
        </div> */}

        {/* Delete Confirmation Modal */}
        {/* {showDeleteModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Event
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this event? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                    onClick={() => handleDeleteEvent(selectedEvent)}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )} */}
      </main>
      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}