import React, { useEffect, useState } from 'react';
import HeaderPublic from '../Layout/HeaderPublic';
import About from './About';
import Contact from './Contact';
import ProductGallery from './ProductGallery';
import EventGallery from './EventGallery';
import FooterPublic from '../Layout/FooterPublic'; // Import the new footer component
import AOS from 'aos';
import 'aos/dist/aos.css';

const Homepage = () => {
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

  return (
    <div className={theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}>
      <HeaderPublic />
      <main className="hero-section min-h-[calc(100vh-4rem)] flex flex-col justify-between">
        <section id="hero" className="hero section w-full text-center flex-grow flex items-center justify-center">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-5xl font-bold">
              Empowered <span className="text-[#df1f47]">Women</span> in
            </h2>
            <h2 className="text-5xl font-bold mt-2">
              <span className="text-[#df1f47]">Manila</span>
            </h2>
            <p className="mt-6 text-xl">
              Streamline operations, boost productivity, and drive growth with our all-in-one solution.
            </p>
            <div className="mt-8 flex justify-center space-x-6">
              <button className="bg-[#df1f47] text-white text-lg px-8 py-3 rounded-lg shadow-md hover:bg-red-600">
                Learn Our Story
              </button>
              <button className="bg-[#df1f47] text-white text-lg px-8 py-3 rounded-lg shadow-md hover:bg-red-600">
                View Collections
              </button>
            </div>
          </div>
        </section>
        <section className="w-full flex mt-16">
          <div className="w-1/2 bg-[#df1f47] text-white py-12 text-center min-h-[35vh] flex items-center">
            <div className="container mx-auto max-w-2xl">
              <h2 className="text-4xl font-bold">Our Mission</h2>
              <p className="mt-6 text-lg px-6">
                To uplift and empower the women of Manila by providing education, advocacy, and opportunities for economic and social growth.
              </p>
            </div>
          </div>
          <div className="w-1/2 bg-[#df1f47] text-white py-12 text-center min-h-[35vh] flex items-center">
            <div className="container mx-auto max-w-2xl">
              <h2 className="text-4xl font-bold">Our Vision</h2>
              <p className="mt-6 text-lg px-6">
                A community where every woman in Manila thrives with equality, dignity, and sustainable progress.
              </p>
            </div>
          </div>
        </section>
      </main>
      <section id="events-section" className="py-16"><EventGallery /></section>
      <section id="products-section" className="py-16"><ProductGallery /></section>
      {/* <section id="about-section" className="py-16"><Contact /></section> */}
      
      {/* Footer */}
      <FooterPublic />
    </div>
  );
};

export default Homepage;
