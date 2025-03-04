import React, { useEffect, useState, useRef } from 'react';
import { FaUserCircle } from 'react-icons/fa'; // Importing an icon for the founder section
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../Layout/Loader';
const Blog = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const bottomSectionRef = useRef(null);
 const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const handleScrollToBottom = () => {
    if (bottomSectionRef.current) {
      const yOffset = -100; // Adjusted offset for better alignment
      const y = bottomSectionRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/calendar/events/featured`);
        console.log('Fetched Featured Events:', data);
        setFeaturedEvents(data.data.slice(0, 3));
      } catch (error) {
        console.error('Failed to load featured events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvents();
  }, []);

  return (
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-gray-900 text-white" : "bg-base-200 text-black"}`}>
      <HeaderPublic />

      {/* Card at the top */}
      <div className="w-full flex  mt-8 md:mt-8 px-8 md:px-8">
        <div className="w-full min-h-[45vh] p-12 rounded-lg shadow-lg bg-[#df1f47] text-white">
          <h2 className="text-6xl font-bold mb-6 ">Our Community</h2>
          <h2 className="text-6xl font-bold mb-6 ">Journey</h2>
          <p className="text-2xl mb-8 ">
            Discover the stories of innovation and collaboration that have shaped our platform.
          </p>
          <div className="flex">
            <button
              onClick={handleScrollToBottom}
              className="btn px-6 py-3 text-xl mt-12 bg-white text-[#df1f47] hover:bg-gray-200 transition duration-200"
            >
              Read More
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div ref={bottomSectionRef} className="w-full flex flex-col md:flex-row items-center justify-center mt-12 px-8 gap-12 mb-12">
        {/* Left side - Image */}
        <div className="w-full md:w-1/2">
          <img 
            src="https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png" 
            alt="Community" 
            className="w-full h-[720px] object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Right side - Paragraph */}
        <div className={`w-full md:w-1/2 flex flex-col justify-center ${theme === "dark" ? "text-white" : "text-black"}`}>
          <h3 className="text-6xl font-bold mb-4 text-[#df1f47]">A Message from our Founder</h3>
          <p className="text-2xl mt-4">
            When I started this journey five years ago, I had a simple vision: to 
            create a platform that would empower creators and innovators to bring their 
            ideas to life without technical barriers.
          </p>
          <p className="text-2xl mt-4">
            What began as a small project in my apartment has grown into a vibrant community of thousands of 
            passionate individuals who are pushing the boundaries of what's possible in their respective fields.
          </p>
          <p className="text-2xl mt-4">
            Our platform was built on the principle that collaboration and knowledge-sharing are the foundations 
            of innovation. We've stayed true to this belief, continuously evolving our tools based on the feedback 
            and needs of our community.
          </p>
          <p className="text-2xl mt-4">
            The stories you'll read below are from some of our earliest supporters - our pioneers - who took a 
            chance on us when we were just starting out. Their insights and contributions have been invaluable 
            in shaping what we've become today.
          </p>
          <p className="text-2xl mt-4">
            As we look to the future, we remain committed to our mission of democratizing technology and empowering 
            creators worldwide. Thank you for being part of this incredible journey.
          </p>

          {/* Founder Section */}
          <div className="flex items-center mt-8 space-x-4">
            <FaUserCircle className="text-5xl text-[#df1f47]" />
            <div>
              <p className="text-2xl font-bold">Sarah Williams</p>
              <p className="text-lg">Founder</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Pioneers Section */}
      <div className="w-full text-center my-12 px-8">
        <h2 className="text-6xl font-bold text-[#df1f47]">Our Pioneers</h2>
        <h3 className="text-2xl mt-4">Meet the early adopters who helped shape our platform and continue to inspire our community</h3>
        <h3 className="text-2xl mt-4"> with their innovative work.</h3>
      </div>
      <div className="w-full flex flex-col md:flex-row justify-center gap-28 px-8 mt-10 mb-10">
      <div className={`relative w-full max-w-xl p-10 border-2 border-red-300 rounded-3xl shadow-lg min-h-[650px] 
  ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>

  {/* Profile Image */}
  <div className="absolute -top-20 -left-14 w-48 h-48 bg-gray-200 rounded-full border-4 border-white overflow-hidden">
    <img
      src="https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png"
      alt="Profile"
      className="w-52 h-52 object-cover rounded-full border-4 border-white shadow-lg"
    />
  </div>

  {/* Name and Membership Info */}
  <div className="flex items-center pl-28">
    <div>
      <p className="text-4xl font-bold">Sarah Williams</p>
      <p className="text-xl opacity-80">Member since 2000</p>
    </div>
  </div>

  {/* Testimonial Text */}
  <div className="mt-8 space-y-5">
    <p className="text-xl leading-relaxed">
      "This platform completely transformed how I approach design projects. The
      collaborative tools are intuitive and powerful."
    </p>
    <p className="text-xl leading-relaxed">
      "This platform completely transformed how I approach design projects. The
      collaborative tools are intuitive and powerful."
    </p>
    <p className="text-xl leading-relaxed">
      "This platform completely transformed how I approach design projects. The
      collaborative tools are intuitive and powerful."
    </p>
  </div>
</div>

<div className={`relative w-full max-w-xl p-10 border-2 border-red-300 rounded-3xl shadow-lg min-h-[650px] 
  ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>

  {/* Profile Image */}
  <div className="absolute -top-20 -left-14 w-48 h-48 bg-gray-200 rounded-full border-4 border-white overflow-hidden">
    <img
      src="https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png"
      alt="Profile"
      className="w-52 h-52 object-cover rounded-full border-4 border-white shadow-lg"
    />
  </div>

  {/* Name and Membership Info */}
  <div className="flex items-center pl-28">
    <div>
      <p className="text-4xl font-bold">Sarah Williams</p>
      <p className="text-xl opacity-80">Member since 2000</p>
    </div>
  </div>

  {/* Testimonial Text */}
  <div className="mt-8 space-y-5">
    <p className="text-xl leading-relaxed">
      "This platform completely transformed how I approach design projects. The
      collaborative tools are intuitive and powerful."
    </p>
    <p className="text-xl leading-relaxed">
      "This platform completely transformed how I approach design projects. The
      collaborative tools are intuitive and powerful."
    </p>
    <p className="text-xl leading-relaxed">
      "This platform completely transformed how I approach design projects. The
      collaborative tools are intuitive and powerful."
    </p>
  </div>
</div>

</div>
<div className="w-full flex flex-col md:flex-row justify-center gap-28 px-8 mt-20 mb-5">
<div className={`relative w-full max-w-xl p-10 border-2 border-red-300 rounded-3xl shadow-lg min-h-[650px] 
  ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>

  {/* Profile Image */}
  <div className="absolute -top-20 -left-14 w-48 h-48 bg-gray-200 rounded-full border-4 border-white overflow-hidden">
    <img
      src="https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png"
      alt="Profile"
      className="w-52 h-52 object-cover rounded-full border-4 border-white shadow-lg"
    />
  </div>

  {/* Name and Membership Info */}
  <div className="flex items-center pl-28">
    <div>
      <p className="text-4xl font-bold">Sarah Williams</p>
      <p className="text-xl opacity-80">Member since 2000</p>
    </div>
  </div>

  {/* Testimonial Text */}
  <div className="mt-8 space-y-5">
    <p className="text-xl leading-relaxed">
      "This platform completely transformed how I approach design projects. The
      collaborative tools are intuitive and powerful."
    </p>
    <p className="text-xl leading-relaxed">
      "This platform completely transformed how I approach design projects. The
      collaborative tools are intuitive and powerful."
    </p>
    <p className="text-xl leading-relaxed">
      "This platform completely transformed how I approach design projects. The
      collaborative tools are intuitive and powerful."
    </p>
  </div>
</div>

<div className={`relative w-full max-w-xl p-10 border-2 border-red-300 rounded-3xl shadow-lg min-h-[650px] 
  ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>

  {/* Profile Image */}
  <div className="absolute -top-20 -left-14 w-48 h-48 bg-gray-200 rounded-full border-4 border-white overflow-hidden">
    <img
      src="https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png"
      alt="Profile"
      className="w-52 h-52 object-cover rounded-full border-4 border-white shadow-lg"
    />
  </div>

  {/* Name and Membership Info */}
  <div className="flex items-center pl-28">
    <div>
      <p className="text-4xl font-bold">Sarah Williams</p>
      <p className="text-xl opacity-80">Member since 2000</p>
    </div>
  </div>

  {/* Testimonial Text */}
  <div className="mt-8 space-y-5">
    <p className="text-xl leading-relaxed">
      "This platform completely transformed how I approach design projects. The
      collaborative tools are intuitive and powerful."
    </p>
    <p className="text-xl leading-relaxed">
      "This platform completely transformed how I approach design projects. The
      collaborative tools are intuitive and powerful."
    </p>
    <p className="text-xl leading-relaxed">
      "This platform completely transformed how I approach design projects. The
      collaborative tools are intuitive and powerful."
    </p>
  </div>
</div>


</div>
<h2 className="text-2xl font-bold italic text-[#df1f47] text-center mb-5">Join our growing community of innovators and become part of our story</h2>
{loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4  mb-10">
            {featuredEvents.map((event) => (
              <div className={`rounded-lg overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'}`} key={event._id} >
                <div className="relative">
                  <img
                    src={event.image || 'https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png'}
                    alt={event.title}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 hover:opacity-100">
                  <button
  onClick={() => navigate(`/event/${event._id}`)}
  className="bg-white text-black border border-black px-4 py-2 text-sm rounded hover:bg-black hover:text-white transition-all duration-300"
>
  View
</button>
                    
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{event.location || 'Unknown Location'}</span>
                    <span className="text-right font-bold text-[#df1f47]">{new Date(event.date).toDateString()}</span>
                  </div>
                  <div className="text-xl font-bold text-[#df1f47] font-poppins text-left">{event.title}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      <FooterPublic />
    </div>
    
  );

};

export default Blog;
