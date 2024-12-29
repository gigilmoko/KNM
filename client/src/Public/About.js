import React from 'react';
import HeaderPublic from '../Layout/HeaderPublic';

import '../assets/css/about.css';
import Pic1 from '../assets/img/aboutpic1.jpg'
import Pic2 from '../assets/img/aboutpic2.jpg'
import Pic3 from '../assets/img/aboutpic3.jpg'
import Pic4 from '../assets/img/aboutpic4.jpg'


const About = () => {
  return (
    

      <div className="about-section">
      <div className="left-column">
      <img src={Pic1} alt="About pic1" />
      <img src={Pic2} alt="About pic2" />
      <img src={Pic3} alt="About pic3" />
      <img src={Pic4} alt="About pic4" />
      </div>
      <div className="right-column">
        <h2>About Us</h2>
        <p>
        The Kababaihan ng Maynila is a community-focused nonprofit organization dedicated 
        to empowering women by providing them with livelihood skills and opportunities for 
        financial independence. Our mission is to uplift and support women, especially the 
        elderly, by teaching them valuable skills that allow them to earn extra income through 
        the creation of sustainable, reusable, and recyclable products.

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
      </div>
    </div>

    
  );
};

export default About;
