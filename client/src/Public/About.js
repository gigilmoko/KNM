import React from 'react';

import Pic1 from '../assets/img/aboutpic1.jpg';
import Pic2 from '../assets/img/aboutpic2.jpg';
import Pic3 from '../assets/img/aboutpic3.jpg';
import Pic4 from '../assets/img/aboutpic4.jpg';
import Header from '../Layout/HeaderPublic';

const About = ({ isPreview = false }) => {
  return (
    <div className="min-h-screen bg-base-200 text-black dark:bg-gray-900 dark:text-white">
      {!isPreview && <Header />}

      <section className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-12 items-center">
        {/* Image Gallery */}
        <div className="grid grid-cols-2 gap-4 md:w-1/2">
          <img src={Pic1} alt="About pic1" className="rounded-xl shadow-lg object-cover w-full h-40 md:h-56" />
          <img src={Pic2} alt="About pic2" className="rounded-xl shadow-lg object-cover w-full h-40 md:h-56" />
          <img src={Pic3} alt="About pic3" className="rounded-xl shadow-lg object-cover w-full h-40 md:h-56" />
          <img src={Pic4} alt="About pic4" className="rounded-xl shadow-lg object-cover w-full h-40 md:h-56" />
        </div>

        {/* About Content */}
        <div className="md:w-1/2">
          <h2 className="text-4xl font-bold mb-6 text-[#df1f47]">About Us</h2>
          {isPreview ? (
            <>
              <p className="mb-4 text-lg">
                The Kababaihan ng Maynila is a nonprofit organization dedicated to empowering women by teaching them livelihood skills and providing financial independence opportunities.
              </p>
              <a
                href="/about"
                className="inline-block mt-2 px-6 py-2 bg-[#df1f47] text-white rounded-lg shadow hover:bg-[#c0183d] transition"
              >
                Read More
              </a>
            </>
          ) : (
            <>
              <p className="mb-4 text-lg">
                The Kababaihan ng Maynila is a community-focused nonprofit organization dedicated
                to empowering women by providing them with livelihood skills and opportunities for
                financial independence. Our mission is to uplift and support women, especially the
                elderly, by teaching them valuable skills that allow them to earn extra income through
                the creation of sustainable, reusable, and recyclable products.
              </p>
              <p className="mb-4 text-lg">
                We take pride in offering eco-friendly and profitable products made from recyclable
                materials, including our Foldable, Washable, and Recyclable Christmas Parol, KNM Accessories
                crafted from activated charcoal (known for its protective properties against fungus,
                bacteria, and viruses), as well as Bean Bags and Throw Pillows made from repurposed materials.
              </p>
              <p className="mb-4 text-lg">
                At Kababaihan ng Maynila, we focus on creating handcrafted products from scratch, ensuring
                quality and uniqueness in every item. These products are sold to a wide range of customers,
                helping to create a sustainable livelihood for our members while contributing to environmental
                preservation. Through our programs, we aim to inspire and empower women to become financially
                independent and confident, while also promoting social responsibility and sustainability in our community.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default About;