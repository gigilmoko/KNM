import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import '../assets/css/about.css';
import Pic1 from '../assets/img/aboutpic1.jpg';
import Pic2 from '../assets/img/aboutpic2.jpg';
import Pic3 from '../assets/img/aboutpic3.jpg';
import Pic4 from '../assets/img/aboutpic4.jpg';
import Header from '../Layout/HeaderPublic';

const About = ({ isPreview = false }) => {
  useEffect(() => {
      AOS.init({ 
        duration: 1000, // Animation duration in milliseconds
        once: true,     // Whether animation should happen only once - while scrolling down
      });
    }, []);
  return (
    <div>
      {/* Conditionally render the Header only if not in preview mode */}
      {!isPreview && <Header />}
      
      <div className="about-section">
        <div className="left-column">
          <img src={Pic1} alt="About pic1" data-aos="fade-up" data-aos-delay="100"/>
          <img src={Pic2} alt="About pic2" data-aos="fade-up" data-aos-delay="200"/>
          <img src={Pic3} alt="About pic3" data-aos="fade-up" data-aos-delay="300"/>
          <img src={Pic4} alt="About pic4" data-aos="fade-up" data-aos-delay="400"/>
        </div>
        <div className="right-column" data-aos="fade-up" data-aos-delay="300">
          <h2>About Us</h2>
          {isPreview ? (
            <>
              <p>
                The Kababaihan ng Maynila is a nonprofit organization dedicated to empowering women by teaching them livelihood skills and providing financial independence opportunities.
              </p>
              <a href="/about" className="read-more-link">Read More</a>
            </>
          ) : (
            <>
              <p>
                The Kababaihan ng Maynila is a community-focused nonprofit organization dedicated
                to empowering women by providing them with livelihood skills and opportunities for
                financial independence. Our mission is to uplift and support women, especially the
                elderly, by teaching them valuable skills that allow them to earn extra income through
                the creation of sustainable, reusable, and recyclable products.
              </p>
              <p>
                We take pride in offering eco-friendly and profitable products made from recyclable
                materials, including our Foldable, Washable, and Recyclable Christmas Parol, KNM Accessories
                crafted from activated charcoal (known for its protective properties against fungus,
                bacteria, and viruses), as well as Bean Bags and Throw Pillows made from repurposed materials.
              </p>
              <p>
                At Kababaihan ng Maynila, we focus on creating handcrafted products from scratch, ensuring
                quality and uniqueness in every item. These products are sold to a wide range of customers,
                helping to create a sustainable livelihood for our members while contributing to environmental
                preservation. Through our programs, we aim to inspire and empower women to become financially
                independent and confident, while also promoting social responsibility and sustainability in our community.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default About;
