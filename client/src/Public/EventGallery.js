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
      title: 'End-of-Year Dividend Distribution for Kababaihan ng Maynila Members',
      image: 'https://res.cloudinary.com/dceswjquk/image/upload/v1750175044/Event3_v2wk1y.jpg',
    },
    {
      _id: '2',
      title: 'Liwanag ng Kababaihan: Parol-Making Project ',
      image: 'https://res.cloudinary.com/dceswjquk/image/upload/v1750175046/Event1_sz7aiq.jpg',
    },
    {
      _id: '3',
      title: 'L39th Anniversary of Kababaihan ng Maynila',
      image: 'https://res.cloudinary.com/dceswjquk/image/upload/v1750175047/Event2_gbnda5.png',
    },
  ];

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} py-12`}>
      {location.pathname !== '/' && <Header />}

      <div className="text-center bg-transparent px-2 sm:px-4">
        <h2 className="text-3xl sm:text-4xl font-bold uppercase font-poppins text-[#df1f47]">
          Featured Events
        </h2>
        <p className="text-base sm:text-lg mt-2 max-w-xl mx-auto">
          Stay updated with the latest events happening near you.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-2 sm:px-4 mt-8">
          {featuredEvents.map((event) => (
            <div
              className={`rounded-2xl overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105 ${
                theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'
              } flex flex-col`}
              key={event._id}
            >
              <div className="relative group">
                <img
                  src={event.image || 'placeholder.jpg'}
                  alt={event.title}
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    className="bg-white text-[#df1f47] border border-[#df1f47] px-4 py-2 text-sm rounded hover:bg-[#df1f47] hover:text-white transition"
                    onClick={() => navigate(`/blog?eventId=${event._id}`)}
                  >
                    View
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-center">
                <div
                  className="text-base sm:text-lg md:text-xl text-[#df1f47] font-poppins text-left break-words"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.8em',
                    lineHeight: '1.4em',
                    wordBreak: 'break-word',
                    fontWeight: 'normal', // Ensure not bold
                  }}
                >
                  {event.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventGallery;