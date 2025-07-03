import React, { useEffect, useState } from 'react';
import HeaderPublic from '../Layout/HeaderPublic';
import { useNavigate } from 'react-router-dom';
import ProductGallery from './ProductGallery';
import EventGallery from './EventGallery';
import FooterPublic from '../Layout/FooterPublic';

const Homepage = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Trigger animations on load
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'} overflow-hidden`}>
      <HeaderPublic />
      
      <main className="relative">
        {/* Hero Section with Enhanced Design */}
        <section
          id="hero"
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#df1f47]/10 via-pink-50 to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
            {/* Floating geometric shapes */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-[#df1f47]/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-300/30 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-300/20 rounded-full blur-lg animate-bounce delay-500"></div>
            <div className="absolute top-40 right-1/4 w-16 h-16 bg-[#df1f47]/15 rounded-lg rotate-45 animate-pulse delay-700"></div>
          </div>

          {/* Hero Content */}
          <div className={`relative z-10 max-w-6xl mx-auto px-4 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-[#df1f47] px-6 py-2 rounded-full text-sm font-semibold mb-8 shadow-lg border border-[#df1f47]/20">
              <span className="w-2 h-2 bg-[#df1f47] rounded-full animate-pulse"></span>
              Empowering Women Since 1990
            </div>

            {/* Main Heading with Gradient Text */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6">
              <span className="block bg-gradient-to-r from-[#df1f47] to-pink-600 bg-clip-text text-transparent">
                Empowered
              </span>
              <span className="block text-gray-900 dark:text-white">
                Women in
              </span>
              <span className="block bg-gradient-to-r from-[#df1f47] to-purple-600 bg-clip-text text-transparent">
                Manila
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl font-light text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              Building stronger communities through 
              <span className="text-[#df1f47] font-semibold"> women empowerment</span>, 
              <span className="text-[#df1f47] font-semibold"> skill development</span>, and 
              <span className="text-[#df1f47] font-semibold"> economic independence</span>
            </p>

            {/* CTA Buttons with Enhanced Design */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <button
                className="group relative bg-[#df1f47] text-white text-lg px-10 py-4 rounded-2xl shadow-2xl hover:shadow-[#df1f47]/25 transform hover:scale-105 transition-all duration-300 font-semibold overflow-hidden"
                onClick={() => navigate("/blog")}
              >
                <span className="relative z-10">Discover Our Journey</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#df1f47] to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button
                className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-[#df1f47] border-2 border-[#df1f47] text-lg px-10 py-4 rounded-2xl shadow-xl hover:bg-[#df1f47] hover:text-white transform hover:scale-105 transition-all duration-300 font-semibold"
                onClick={() => navigate("/products")}
              >
                <span className="flex items-center gap-2">
                  Explore Collections
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Scroll Indicator */}
            <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
              <span className="text-sm mb-2">Scroll to explore</span>
              <div className="animate-bounce">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section with Enhanced Cards */}
        <section className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Our <span className="text-[#df1f47]">Purpose</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Driven by passion, guided by purpose, united for change
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Mission Card */}
              <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-gray-100 dark:border-gray-700">
                <div className="absolute -top-6 left-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#df1f47] to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="pt-6">
                  <h3 className="text-2xl font-bold text-[#df1f47] mb-4">Our Mission</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    To uplift and empower the women of Manila through comprehensive education, 
                    passionate advocacy, and meaningful opportunities for economic and social growth.
                  </p>
                </div>
                {/* Decorative Element */}
                <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-16 h-16 text-[#df1f47]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>

              {/* Vision Card */}
              <div className="group relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border border-gray-100 dark:border-gray-700">
                <div className="absolute -top-6 left-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-[#df1f47] rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <div className="pt-6">
                  <h3 className="text-2xl font-bold text-[#df1f47] mb-4">Our Vision</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                    A thriving community where every woman in Manila flourishes with 
                    equality, dignity, and sustainable progress as the foundation for lasting change.
                  </p>
                </div>
                {/* Decorative Element */}
                <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-16 h-16 text-[#df1f47]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-[#df1f47] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#df1f47] via-pink-600 to-purple-600 opacity-90"></div>
          <div className="relative z-10 max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">What Drives Us</h2>
              <p className="text-xl opacity-90">Core values that shape our community</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  title: "Empowerment", 
                  description: "Providing tools and knowledge for women to take control of their futures",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )
                },
                { 
                  title: "Community", 
                  description: "Building strong networks that support and uplift each member",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  )
                },
                { 
                  title: "Innovation", 
                  description: "Embracing new ideas and methods to create lasting positive change",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )
                }
              ].map((value, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors duration-300">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-white/90 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Section */}
        {/* <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Creating <span className="text-[#df1f47]">Real Impact</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Every woman empowered creates ripples of positive change in our community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: "Years of Service", highlight: "30+" },
                { label: "Women Supported", highlight: "500+" },
                { label: "Skills Programs", highlight: "25+" },
                { label: "Community Partners", highlight: "50+" }
              ].map((item, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
                    <div className="text-3xl md:text-4xl font-bold text-[#df1f47] mb-2 group-hover:scale-110 transition-transform duration-300">
                      {item.highlight}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 font-medium">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section> */}
      </main>

      {/* Events Gallery */}
      <section id="events-section" className="py-20 px-4 bg-gray-50 dark:bg-gray-800">
        <EventGallery />
      </section>

      {/* Products Gallery */}
      <section id="products-section" className="py-20 px-4">
        <ProductGallery />
      </section>

      {/* Footer */}
      <FooterPublic />
    </div>
  );
};

export default Homepage;