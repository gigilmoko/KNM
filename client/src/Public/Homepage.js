import React, { useEffect, useState } from 'react';
import HeaderPublic from '../Layout/HeaderPublic';
import { useNavigate } from 'react-router-dom';
import ProductGallery from './ProductGallery';
import EventGallery from './EventGallery';
import FooterPublic from '../Layout/FooterPublic';

const Homepage = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  return (
    <div className={theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}>
      <HeaderPublic />
      <main className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
        {/* Hero Section */}
        <section
          id="hero"
          className="w-full flex flex-col items-center justify-center text-center py-20 px-4 bg-gradient-to-b from-[#fff0f4] to-transparent dark:from-gray-900 dark:to-gray-800 transition-colors duration-300"
        >
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-2">
              Empowered <span className="text-[#df1f47]">Women</span> in
            </h1>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
              <span className="text-[#df1f47]">Manila</span>
            </h2>
            <p className="mt-4 text-lg md:text-2xl font-light max-w-2xl mx-auto">
              Streamline operations, boost productivity, and drive growth with our all-in-one solution.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <button
                className="bg-[#df1f47] text-white text-lg px-8 py-3 rounded-lg shadow-md hover:bg-red-600 transition"
                onClick={() => navigate("/blog")}
              >
                Learn Our Story
              </button>
              <button
                className="bg-white text-[#df1f47] border border-[#df1f47] text-lg px-8 py-3 rounded-lg shadow-md hover:bg-[#df1f47] hover:text-white transition"
                onClick={() => navigate("/products")}
              >
                View Collections
              </button>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="w-full flex flex-col md:flex-row mt-12 md:mt-16 gap-4 px-4">
          <div className="flex-1 bg-[#fff0f4] dark:bg-gray-800 text-[#df1f47] dark:text-white py-12 px-6 rounded-3xl flex items-center justify-center shadow-lg transition">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission</h2>
              <p className="text-base md:text-lg font-light">
                To uplift and empower the women of Manila by providing education, advocacy, and opportunities for economic and social growth.
              </p>
            </div>
          </div>
          <div className="flex-1 bg-[#fff0f4] dark:bg-gray-800 text-[#df1f47] dark:text-white py-12 px-6 rounded-3xl flex items-center justify-center shadow-lg transition">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Vision</h2>
              <p className="text-base md:text-lg font-light">
                A community where every woman in Manila thrives with equality, dignity, and sustainable progress.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Events Gallery */}
      <section id="events-section" className="py-16 px-4">
        <EventGallery />
      </section>

      {/* Products Gallery */}
      <section id="products-section" className="py-8 px-4">
        <ProductGallery />
      </section>

      {/* Footer */}
      <FooterPublic />
    </div>
  );
};

export default Homepage;