'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import { Calendar, MapPin, DollarSign, Users, Image as ImageIcon, Clock, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Add these styles at the top of your file or in your CSS
const dateTimeStyles = {
  dateInput: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    width: '100%',
    fontSize: '1rem',
    color: '#1a202c',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    '&:hover': {
      borderColor: '#3b82f6',
    },
    '&:focus': {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
  },
  timeInput: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    width: '100%',
    fontSize: '1rem',
    color: '#1a202c',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    '&:hover': {
      borderColor: '#3b82f6',
    },
    '&:focus': {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    },
  },
};

export default function CreateEventPage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
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

  // Custom day styling for react-datepicker
  const dayClassName = date => {
    const isToday = new Date().toDateString() === date.toDateString();
    return [
      'rounded-full transition-colors duration-200',
      isToday ? 'bg-blue-100 text-blue-700 font-bold' : 'hover:bg-blue-50',
    ].join(' ');
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
    setLoading(true);
    setError(null);
    setSuccess(null);

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
        // Try to get error message from backend
        let errorMsg = 'Failed to create event';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || JSON.stringify(errorData) || errorMsg;
        } catch {
          // fallback to default error
        }
        throw new Error(errorMsg);
      }

      setSuccess('Event created successfully!');
      setTimeout(() => {
        router.push('/manager/home');
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create New Event</h1>
          {/* Success and Error Messages */}
          {success && (
            <div className="mb-4 p-3 rounded bg-green-100 text-green-800 text-center font-semibold">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-800 text-center font-semibold">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">Event Name</label>
              <input
                type="text"
                name="eventName"
                id="eventName"
                value={formData.eventName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="desc" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="desc"
                id="desc"
                value={formData.desc}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                required
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                id="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
              <input
                type="text"
                name="city"
                id="city"
                value={formData.city}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                name="state"
                id="state"
                value={formData.state}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                id="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="eventCapacity" className="block text-sm font-medium text-gray-700">Event Capacity</label>
              <input
                type="number"
                name="eventCapacity"
                id="eventCapacity"
                value={formData.eventCapacity}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700">Ticket Price</label>
              <input
                type="number"
                name="ticketPrice"
                id="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Date</label>
                <div className="relative">
                  <DatePicker
                    selected={eventDate}
                    onChange={date => setEventDate(date)}
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select date"
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    calendarClassName="!z-50 rounded-xl border border-blue-200 shadow-lg p-2"
                    dayClassName={dayClassName}
                    popperPlacement="bottom"
                    minDate={new Date()}
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={eventTime}
                    onChange={e => setEventTime(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="text-gray-400 hover:text-red-500"
                    title="Remove"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              {previewUrl && (
                <div className="mt-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-24 w-24 object-cover rounded-lg border border-gray-200 shadow"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </div>
      </main>
      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }

        input[type="time"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }

        input[type="date"]:focus,
        input[type="time"]:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}
