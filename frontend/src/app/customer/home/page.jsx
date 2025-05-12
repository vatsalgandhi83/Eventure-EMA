'use client';

import { useState, useEffect } from 'react';
import EventCard from '@/components/EventCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function CustomerHomePage() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [
    {
      url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074&auto=format&fit=crop",
      title: "Music Festivals",
      description: "Experience the rhythm of live music"
    },
    {
      url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop",
      title: "Tech Conferences",
      description: "Stay ahead with the latest innovations"
    },
    {
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
      title: "Food & Wine",
      description: "Savor the finest culinary experiences"
    },
    {
      url: "https://images.unsplash.com/photo-1574602904324-a9ac0fe65331?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      title: "Sports Events",
      description: "Feel the thrill of live sports"
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchEvents();
  }, [isAuthenticated]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:9000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      console.log('API Response:', data);
      console.log('First event image:', data[0]?.eventImageBase64?.substring(0, 100));
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (eventId) => {
    router.push(`/event/${eventId}`);
  };

  const filteredEvents = events.filter(event => {
    // Convert search query and event data to lowercase for case-insensitive comparison
    const searchLower = searchQuery.toLowerCase().trim();
    const locationLower = locationQuery.toLowerCase().trim();

    // Search in event name and description
    const matchesSearch = searchLower === '' || 
      event.eventName.toLowerCase().includes(searchLower) ||
      event.desc.toLowerCase().includes(searchLower) ||
      event.eventCategory?.toLowerCase().includes(searchLower);

    // Search in location (city, state, and address)
    const matchesLocation = locationLower === '' ||
      event.city?.toLowerCase().includes(locationLower) ||
      event.state?.toLowerCase().includes(locationLower) ||
      event.address?.toLowerCase().includes(locationLower);

    return matchesSearch && matchesLocation;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading events...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Find Your Perfect Event</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border-2 border-indigo-100 rounded-xl leading-5 bg-white/80 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-200"
              />
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by city, state, or address..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border-2 border-indigo-100 rounded-xl leading-5 bg-white/80 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 hover:border-indigo-200"
              />
            </div>
          </div>
          {/* Search Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
            {(searchQuery || locationQuery) && (
              <span>
                {' '}matching your search
                {searchQuery && ` "${searchQuery}"`}
                {locationQuery && ` in "${locationQuery}"`}
              </span>
            )}
          </div>
        </div>

        {/* Event Carousel */}
        <div className="relative mb-12 overflow-hidden rounded-2xl shadow-xl">
          <div className="relative h-[400px]">
            {carouselImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="relative h-full">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <h3 className="text-3xl font-bold mb-2">{image.title}</h3>
                      <p className="text-lg text-gray-200">{image.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all duration-200"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">
              No events found matching your search criteria.
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
} 