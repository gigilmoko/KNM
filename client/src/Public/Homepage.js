import React from 'react';
import HeaderPublic from '../Layout/HeaderPublic';

import '../assets/css/homepage.css';
import LogoImage from '../assets/img/logo.png'

const Homepage = () => {
  return (
    <div className="homepage">
      {/* Header */}
      <HeaderPublic />
      {/* <header className="homepage-header">
        <div className="logo">
          <img src={LogoImage} alt="Bituin Logo" />
          <span>BITUIN</span>
        </div>
        <nav className="navbar">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#programs">Programs</a>
          <a href="#contact">Contact</a>
          <a href="#login" className="login-button">Log in</a>
        </nav>
      </header> */}

      {/* Main Section */}
      <main className="hero-section">
    <div className="hero-content">
        <h1>Crafted with Care, <br/>Inspired by Tradition</h1>
        <p>
            Empowers women through skill-building and handmade products, <br/> fostering economic independence and community growth.
        </p>

        <div className="buttons">
            <button className="get-started">Get started</button>
            <button className="learn-more">Learn more</button>
        </div>
    </div>
</main>

    </div>
  );
};

export default Homepage;
