import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../Layout/HeaderPublic';

const EventGallery = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isVisible, setIsVisible] = useState(false);

  const featuredEvents = [
    {
      _id: '1',
      title: 'End-of-Year Dividend Distribution for Kababaihan ng Maynila Members',
      image: 'https://res.cloudinary.com/dceswjquk/image/upload/v1750175044/Event3_v2wk1y.jpg',
      date: 'December 2024',
      description: 'Annual dividend distribution celebrating our members\' financial achievements and community growth.'
    },
    {
      _id: '2',
      title: 'Liwanag ng Kababaihan: Parol-Making Project',
      image: 'https://res.cloudinary.com/dceswjquk/image/upload/v1750175046/Event1_sz7aiq.jpg',
      date: 'November 2024',
      description: 'Traditional Filipino lantern crafting workshop promoting cultural heritage and creativity.'
    },
    {
      _id: '3',
      title: '39th Anniversary of Kababaihan ng Maynila',
      image: 'https://res.cloudinary.com/dceswjquk/image/upload/v1750175047/Event2_gbnda5.png',
      date: 'October 2024',
      description: 'Celebrating 39 years of women empowerment and community service in Manila.'
    },
  ];

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Trigger animations on load
    setTimeout(() => setIsVisible(true), 300);
  }, []);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} py-16 relative overflow-hidden`}>
      {location.pathname !== '/' && <Header />}

      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#df1f47]/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-300/15 rounded-full blur-xl animate-bounce delay-500"></div>
      </div>

      <div className="relative z-10 text-center bg-transparent px-2 sm:px-4">
        {/* Enhanced Header Section */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-[#df1f47] px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg border border-[#df1f47]/20">
            <span className="w-2 h-2 bg-[#df1f47] rounded-full animate-pulse"></span>
            Community Highlights
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase font-poppins mb-4">
            <span className="bg-gradient-to-r from-[#df1f47] to-pink-600 bg-clip-text text-transparent">
              Featured
            </span>
            <br />
            <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Events
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl font-light text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Discover the inspiring stories and memorable moments from our 
            <span className="text-[#df1f47] font-semibold"> community celebrations</span> and 
            <span className="text-[#df1f47] font-semibold"> empowerment initiatives</span>
          </p>
        </div>

        {/* Enhanced Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-2 sm:px-4 mt-12">
          {featuredEvents.map((event, index) => (
            <div
              key={event._id}
              className={`group rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transform transition-all duration-500 hover:-translate-y-2 ${
                theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'
              } flex flex-col border border-gray-100 dark:border-gray-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              <div className="relative overflow-hidden">
                {/* Date Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/20">
                    <span className="text-xs font-semibold text-[#df1f47]">{event.date}</span>
                  </div>
                </div>

                <div className="relative group-hover:scale-105 transition-transform duration-500">
                  <img
                    src={event.image || 'placeholder.jpg'}
                    alt={event.title}
                    className="w-full aspect-[4/3] object-cover"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Enhanced Content Section */}
              <div className="p-6 flex-1 flex flex-col">
                {/* Event Title */}
                <h3 className="text-lg sm:text-xl font-bold text-[#df1f47] mb-3 leading-tight group-hover:text-pink-600 transition-colors duration-300">
                  {event.title}
                </h3>

                {/* Event Description */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed flex-grow">
                  {event.description}
                </p>

                {/* Event Impact Indicator */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-2 text-[#df1f47]">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium">Community Impact</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              // onClick={() => navigate('/events')}
              className="group bg-[#df1f47] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-pink-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              <span className="flex items-center gap-2">
                View All Events
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </button>

            <button
              onClick={() => navigate('/blog')}
              className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-[#df1f47] border-2 border-[#df1f47] px-8 py-4 rounded-2xl font-semibold hover:bg-[#df1f47] hover:text-white transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <span className="flex items-center gap-2">
                Learn About Us
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventGallery;