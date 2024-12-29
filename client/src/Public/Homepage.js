import React from 'react';
import HeaderPublic from '../Layout/HeaderPublic';
import About from './About';
import ProductGallery from './ProductGallery';

import '../assets/css/homepage.css';
import '../assets/css/about.css';
import LogoImage from '../assets/img/logo.png';
import Contact from './Contact';
import Blog from './Blog';


const Homepage = () => {
  return (
    <div className="homepage">
      {/* Header */}
      <HeaderPublic />

      {/* Main Section */}
      <main className="hero-section">
        <div className="hero-content">
          <h1>Crafted with Care, <br />Inspired by Tradition</h1>
          <p>
            Empowers women through skill-building and handmade products, <br /> fostering economic independence and community growth.
          </p>

          <div className="buttons">
            <button className="get-started">Get started</button>
            {/* Add an anchor link to the About Us section */}
            <a href="about" className="learn-more">Learn more</a>
          </div>
        </div>
      </main>

      <About />
      <ProductGallery/>
      <Blog/>
      <Contact/>

      {/* About Us Section
      <div className="about-section" id="about-us">
        <div className="left-column">
          <img src={LogoImage} alt="Bituin Logo" />
          <img src={LogoImage} alt="Bituin Logo" />
          <img src={LogoImage} alt="Bituin Logo" />
          <img src={LogoImage} alt="Bituin Logo" />
        </div>
        <div className="right-column">
          <h2>About Us</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Consectetur,
            quisquam accusantium nostrum modi, nemo, officia veritatis ipsum
            facere maxime assumenda voluptatum enim! Labore maiores placeat
            impedit, vero sed est voluptas!
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Expedita
            alias dicta autem, maiores doloremque quo perferendis, ut obcaecati
            harum.
          </p>
          <b>
            Lonsectetur adipisicing elit. Blanditiis aspernatur, ratione dolore
            vero asperiores explicabo.
          </b>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eos ab
            itaque modi, reprehenderit fugit soluta, molestias optio repellat
            incidunt iure sed deserunt nemo magnam rem explicabo vitae. Cum,
            nostrum, quidem.
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default Homepage;
