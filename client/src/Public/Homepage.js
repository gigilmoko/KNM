import React, { useEffect } from 'react';
import HeaderPublic from '../Layout/HeaderPublic';
import About from './About';
import ProductGallery from './ProductGallery';
import '../assets/css/homepage.css';
import '../assets/css/about.css';
import LogoImage from '../assets/img/KNMlogo.png';
import Contact from './Contact';
import Blog from './Blog';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles


const Homepage = () => {
  useEffect(() => {
    AOS.init({ 
      duration: 1000, // Animation duration in milliseconds
      once: true,     // Whether animation should happen only once - while scrolling down
    });
  }, []);

  return (
    <div className="homepage">
      {/* Header */}
      <HeaderPublic />

      {/* Main Section */}
      <main className="hero-section">

        <section id="hero" class="hero section dark-background">

          {/* <img src="assets/img/hero-bg.jpg" alt="" data-aos="fade-in"/> */}

          <div class="container">
            <h2 data-aos="fade-up" data-aos-delay="100">Crafted with Care,<br/></h2>
            <h2 className="h2-down" data-aos="fade-up" data-aos-delay="100">Inspired by Tradition</h2>
            <p data-aos="fade-up" data-aos-delay="200">Empowers women through skill-building and handmade products,<br/> fostering economic independence and community growth.</p>
            <div class="d-flex mt-4" data-aos="fade-up" data-aos-delay="300">
            <div className="buttons">
                <button className="get-started">Get started</button>
              <a href="about" className="learn-more">Learn more</a>
            </div>
            </div>
            </div>
        </section>
      </main>

      <section id="about-section" data-aos="fade-up"><About isPreview={true} /></section>
      <section id="products-section" data-aos="zoom-in"><ProductGallery /></section>
      <section id="blogs-section" data-aos="fade-left"><Blog/></section>
      <section id="contact-section" data-aos="fade-right"><Contact /></section>
    </div>
  );
};

export default Homepage;
