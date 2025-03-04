import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../Layout/HeaderPublic';

const EventGallery = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/calendar/events/featured`);
        console.log('Fetched Featured Events:', data);
        setFeaturedEvents(data.data.slice(0, 3));
      } catch (error) {
        console.error('Failed to load featured events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {location.pathname !== '/' && <Header />}

      <div className="text-center py-12 bg-transparent">
        <h2 className="text-4xl font-bold uppercase font-poppins text-[#df1f47]" data-aos="zoom-in" data-aos-delay="100">
          Featured Events
        </h2>

        <p className="text-lg mt-2" data-aos="fade-up" data-aos-delay="150">
          Stay updated with the latest events happening near you.
        </p>

        {loading ? (
          <p className="text-lg mt-4">Loading featured events...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 mt-6" data-aos="zoom-in" data-aos-delay="100">
            {featuredEvents.map((event) => (
              <div className={`rounded-lg overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'}`} key={event._id} data-aos="zoom-in" data-aos-delay="200">
                <div className="relative">
                  <img
                    src={event.image || 'placeholder.jpg'}
                    alt={event.title}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 hover:opacity-100">
                    <button
                      className="bg-white text-black border border-black px-4 py-2 text-sm rounded hover:bg-black hover:text-white"
                      onClick={() => navigate(`/event/${event._id}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{event.location || 'Unknown Location'}</span>
                    <span className="text-right font-bold text-[#df1f47]">{new Date(event.date).toDateString()}</span>
                  </div>
                  <div className="text-xl font-bold text-[#df1f47] font-poppins text-left">{event.title}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className="mt-8 px-6 py-3 text-lg font-bold text-white bg-[#df1f47] rounded-full shadow-md hover:bg-[#bf1a3d] transition duration-300"
          data-aos="fade-up"
          data-aos-delay="200"
          onClick={() => navigate('/event-list')}
        >
          View All Events
        </button>
      </div>
    </div>
  );
};

export default EventGallery;
