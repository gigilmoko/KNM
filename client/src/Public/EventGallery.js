import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Header from '../Layout/HeaderPublic';

const EventGallery = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const featuredEvents = [
    {
      _id: '1',
      title: 'Music Festival 2023',
      location: 'Central Park, NY',
      date: '2023-11-15',
      image: 'https://res.cloudinary.com/dglawxazg/image/upload/v1741119999/event2_mloxqk.jpg',
    },
    {
      _id: '2',
      title: 'Art Exhibition',
      location: 'Downtown Gallery, LA',
      date: '2023-12-01',
      image: 'https://res.cloudinary.com/dglawxazg/image/upload/v1743763463/vibrant-art-exhibition-stockcake_ynn3aj.jpg',
    },
    {
      _id: '3',
      title: 'Tech Conference',
      location: 'Silicon Valley, CA',
      date: '2024-01-20',
      image: 'https://res.cloudinary.com/dglawxazg/image/upload/v1743763457/images_1_daeglf.jpg',
    },
  ];

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {location.pathname !== '/' && <Header />}

      <div className="text-center  bg-transparent">
        <h2 className="text-4xl font-bold uppercase font-poppins text-[#df1f47]">
          Featured Events
        </h2>

        <p className="text-lg mt-2">
          Stay updated with the latest events happening near you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 mt-6">
          {featuredEvents.map((event) => (
            <div
              className={`rounded-lg overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105 ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'
              }`}
              key={event._id}
            >
              <div className="relative">
                <img
                  src={event.image || 'placeholder.jpg'}
                  alt={event.title}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 hover:opacity-100">
                  <button
                    className="bg-white text-black border border-black px-4 py-2 text-sm rounded hover:bg-black hover:text-white"
                    onClick={() => navigate(`/blog?eventId=${event._id}`)} // Pass correct eventId
                  >
                    View
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>{event.location || 'Unknown Location'}</span>
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

        {/* <button
          className="mt-8 px-6 py-3 text-lg font-bold text-white bg-[#df1f47] rounded-full shadow-md hover:bg-[#bf1a3d] transition duration-300"
          onClick={() => navigate('/event-list')}
        >
          View All Events
        </button> */}
      </div>
    </div>
  );
};

export default EventGallery;
