import Link from 'next/link';
import { Calendar, MapPin, User } from 'lucide-react';
import { useState } from 'react';

export default function EventCard({ event }) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const handleImageError = () => {
    console.error('Image failed to load for event:', event.eventName);
    setImageError(true);
  };

  // Function to get a placeholder image based on event category
  const getPlaceholderImage = () => {
    const category = event.eventCategory?.toLowerCase() || '';
    if (category.includes('tech') || category.includes('workshop')) {
      return 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?w=500&auto=format&fit=crop&q=60';
    } else if (category.includes('comedy')) {
      return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&auto=format&fit=crop&q=60';
    } else {
      return 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&auto=format&fit=crop&q=60';
    }
  };

  return (
    <Link href={`/event/${event.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative h-48">
          <img
            src={!imageError && event.eventImageBase64 ? event.eventImageBase64 : getPlaceholderImage()}
            alt={event.eventName}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          {event.ticketPrice === 0 && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              FREE
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.eventName}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.desc}</p>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(event.eventDateTime)} at {formatTime(event.eventDateTime)}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{event.city}, {event.state}</span>
            </div>
            
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>{event.available_tickets} of {event.eventCapacity} tickets available</span>
            </div>
          </div>
          
          {event.ticketPrice > 0 && (
            <div className="mt-4">
              <span className="text-lg font-bold text-gray-900">
                ${event.ticketPrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500"> / ticket</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 