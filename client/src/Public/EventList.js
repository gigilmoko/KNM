import React, { useEffect, useState } from 'react';
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { HiCalendar, HiLocationMarker } from "react-icons/hi";

const EventList = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/calendar/events`);
        console.log('Fetched Events:', data);
        if (data.success) {
          setEvents(data.data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className={theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}>
      <HeaderPublic />
      <main className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
        <section className="container mx-auto py-16">
          <h1 className="text-5xl font-bold text-[#df1f47]">All Events</h1>
          {loading ? (
            <p className="text-lg mt-4">Loading events...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 mt-6 mb-10">
              {events.map((event) => (
                <div className={`rounded-lg overflow-hidden shadow-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'}`} key={event._id}>
                  <div className="relative group">
                    <img
                      src={event.image || '/path/to/placeholder.jpg'}
                      alt={event.title}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => navigate(`/event/${event._id}`)}
                        className="bg-white text-black border border-black px-4 py-2 text-sm rounded hover:bg-black hover:text-white transition-all duration-300"
                      >
                        View
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="flex items-center gap-1">
                        <HiLocationMarker className="text-[#df1f47] text-lg" />
                        {event.location || 'Unknown Location'}
                      </span>
                      <span className="text-right font-bold text-[#df1f47]">
                        {new Date(event.date).toDateString()}
                      </span>
                    </div>
                    <div className="text-xl font-bold text-[#df1f47] font-poppins text-left">
                      {event.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <FooterPublic />
    </div>
  );
};

export default EventList;
