'use client';

import { useState, useEffect } from 'react';
import EventCard from '@/components/EventCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Dummy data for testing
const dummyEvents = [
  {
    id: '1',
    eventName: 'Summer Music Festival',
    desc: 'A fantastic summer music festival with top artists',
    city: 'New York',
    state: 'NY',
    date: '2024-07-15',
    time: '14:00',
    price: 50
  },
  {
    id: '2',
    eventName: 'Tech Conference 2024',
    desc: 'Annual technology conference with industry leaders',
    city: 'San Francisco',
    state: 'CA',
    date: '2024-08-20',
    time: '09:00',
    price: 200
  },
  {
    id: '3',
    eventName: 'Food & Wine Expo',
    desc: 'Experience the finest food and wine from around the world',
    city: 'Chicago',
    state: 'IL',
    date: '2024-09-10',
    time: '11:00',
    price: 75
  }
];

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState(dummyEvents);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  // Comment out the actual API call
  /*
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          router.push('/login');
          return;
        }
        const response = await fetch('http://localhost:9000/api/events/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        
        console.log("Event Response", response);

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('accessToken');
            router.push('/login');
            return;
          }
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

    fetchEvents();
  }, [router]);
  */

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = event.city.toLowerCase().includes(locationQuery.toLowerCase()) ||
                          event.state.toLowerCase().includes(locationQuery.toLowerCase());
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Filter by location..."
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
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