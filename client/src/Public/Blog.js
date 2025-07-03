import React, { useEffect, useState, useRef } from 'react';
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Loading from '../Layout/Loader';

const Blog = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const bottomSectionRef = useRef(null);
  const eventRefs = useRef({});
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    // Trigger animation after component mounts
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleScrollToBottom = () => {
    if (bottomSectionRef.current) {
      const yOffset = -80;
      const y = bottomSectionRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/calendar/events/featured`);
        setFeaturedEvents(data.data.slice(0, 3));
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedEvents();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const eventId = queryParams.get('eventId');
    if (eventId && eventRefs.current[eventId]) {
      const element = eventRefs.current[eventId];
      const yOffset = window.innerHeight / 2 - element.getBoundingClientRect().height / 2;
      const y = element.getBoundingClientRect().top + window.scrollY - yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
      <HeaderPublic />

      {/* Enhanced Hero Section */}
      <section className="relative px-4 py-8 md:py-16 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-[#df1f47]/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-pink-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-purple-300/15 rounded-full blur-xl animate-bounce delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-[#df1f47] px-6 py-2 rounded-full text-sm font-semibold mb-8 shadow-lg border border-[#df1f47]/20">
              <span className="w-2 h-2 bg-[#df1f47] rounded-full animate-pulse"></span>
              Our Story
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6">
              <span className="bg-gradient-to-r from-[#df1f47] to-pink-600 bg-clip-text text-transparent">
                Community
              </span>
              <br />
              <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                Journey
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-12">
              Discover the inspiring stories of innovation, collaboration, and empowerment that have shaped 
              <span className="text-[#df1f47] font-semibold"> Kababaihan ng Maynila</span> for nearly four decades.
            </p>

            <button
              onClick={handleScrollToBottom}
              className="group bg-[#df1f47] text-white text-lg px-10 py-4 rounded-2xl shadow-2xl hover:shadow-[#df1f47]/25 transform hover:scale-105 transition-all duration-300 font-semibold"
            >
              <span className="flex items-center gap-2">
                Explore Our Story
                <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Founder Section */}
      <section
        ref={bottomSectionRef}
        className="px-4 py-8 md:py-16"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`rounded-3xl overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 md:p-12`}>
            <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
              {/* Founder Image */}
              <div className="relative flex-shrink-0">
                <div className="w-48 h-48 md:w-64 md:h-64 bg-gray-200 rounded-full border-8 border-white dark:border-gray-700 overflow-hidden shadow-2xl">
                  <img
                    src="https://res.cloudinary.com/dceswjquk/image/upload/v1750175191/beng_slapyt.jpg"
                    alt="Ma. Evelina Beng Atienza"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#df1f47] rounded-full opacity-20"></div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-pink-400 rounded-full opacity-15"></div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-[#df1f47] mb-6">
                  The Heart Behind the Movement
                </h2>
                
                <div className="space-y-4 text-base md:text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                  <p>
                    <strong className="text-[#df1f47]">Ma. Evelina "Beng" Atienza</strong> is the visionary founder whose compassion and belief in women's strength sparked a movement that continues to transform lives across Manila.
                  </p>
                  <p>
                    Inspired by the quiet resilience of everyday women — mothers, wives, daughters — she created a space where no woman would feel alone. Her dream was simple yet powerful: to help women stand on their own, find their voice, and become leaders in their communities.
                  </p>
                  <blockquote className="border-l-4 border-[#df1f47] pl-6 italic text-[#df1f47] font-semibold">
                    "We didn't have much, but we had heart. Today, that heart lives on in every confident member and every handmade product."
                  </blockquote>
                  <p>
                    Her message to future women leaders: <em>"Stay humble. Share what you have — even the smallest act can make a big difference."</em>
                  </p>
                </div>

                <div className="mt-8 p-4 bg-[#df1f47]/5 rounded-2xl">
                  <p className="font-bold text-lg text-[#df1f47]">Ma. Evelina "Beng" Atienza</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Founder & Inspiration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Pioneers Section */}
      <section className="px-4 py-8 md:py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[#df1f47] mb-4">Our Pioneers</h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Meet the remarkable women who helped shape our organization and continue to inspire our community with their dedication and innovation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {[
              {
                name: "Dolores Calayag Mescallado",
                since: "Member since 1987",
                image: "https://res.cloudinary.com/dceswjquk/image/upload/v1750175192/dolores_ypncxj.jpg",
                story: "In 1987, Dolores joined KNM as a young mother, transforming her search for livelihood into a 37-year journey of empowerment and giving back.",
                quote: "I learned not just livelihood, but parenting, understanding children, and life skills that shaped who I am today."
              },
              {
                name: "Marivic Dela Cruz Valle",
                since: "Member since 2001",
                image: "https://res.cloudinary.com/dceswjquk/image/upload/v1750175192/Marivic_jgmq7o.jpg",
                story: "Following her mother's footsteps, Marivic discovered her strengths through handmade crafts and parol-making, growing from shy to confident leader.",
                quote: "Find your strengths and focus on them. If you keep growing what you're good at, you'll thrive."
              },
              {
                name: "Rendy Regala",
                since: "Member since 1996",
                image: "https://res.cloudinary.com/dceswjquk/image/upload/v1750175192/Rendy_p7io8b.jpg",
                story: "Embracing various livelihood skills, especially kakanin and crafts, Rendy developed self-confidence and found joy in creating with others.",
                quote: "Always be humble. If you have a talent, share it — you might inspire someone else."
              },
              {
                name: "Jehanne Marie Castelo",
                since: "Member since 2019",
                image: "https://res.cloudinary.com/dceswjquk/image/upload/v1750175192/Jehanne_bsaslg.jpg",
                story: "In just six years, Jehanne's life has flourished through tailoring work and meaningful bonds with fellow members.",
                quote: "Stay humble. Volunteer. Help in small ways. Share what you have without expecting anything in return."
              }
            ].map((pioneer, index) => (
              <div
                key={index}
                className={`group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}
              >
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={pioneer.image}
                    alt={pioneer.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Floating Quote */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm italic font-medium leading-tight">
                      "{pioneer.quote}"
                    </p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 bg-[#df1f47] rounded-full"></span>
                    <span className="text-sm text-[#df1f47] font-semibold">{pioneer.since}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#df1f47] mb-3">{pioneer.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{pioneer.story}</p>
                  
                  {/* Bottom accent */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-2 text-[#df1f47]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Pioneer Member</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 py-8 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#df1f47]/10 via-pink-50 to-purple-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-[#df1f47] mb-4">
              Join Our Growing Community
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Become part of our story and help us continue empowering women in Manila
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/products')}
                className="bg-[#df1f47] text-white px-8 py-3 rounded-2xl font-semibold hover:bg-[#c0183d] transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Explore Our Products
              </button>
              <button
                onClick={() => navigate('/about')}
                className="bg-white dark:bg-gray-800 text-[#df1f47] border-2 border-[#df1f47] px-8 py-3 rounded-2xl font-semibold hover:bg-[#df1f47] hover:text-white transform hover:scale-105 transition-all duration-300"
              >
                Learn More About Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Featured Events */}
      <section className="px-4 py-8 md:py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#df1f47] mb-4">Recent Highlights</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Stay updated with our latest community events and achievements
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loading />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event, index) => (
                <div
                  key={event._id}
                  className={`group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={event.image || 'https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png'}
                      alt={event.title}
                      className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <button
                      onClick={() => navigate(`/event/${event._id}`)}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-[#df1f47] px-6 py-3 rounded-full font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#df1f47] hover:text-white"
                    >
                      View Details
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-[#df1f47] font-semibold">{event.location || 'Manila'}</span>
                      <span className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#df1f47] mb-3 line-clamp-2">{event.title}</h3>
                    <div className="flex items-center gap-2 text-[#df1f47]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium">Community Impact</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Feature Stories Section */}
      <section className="px-4 py-8 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#df1f47] mb-4">Featured Stories</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Celebrating our achievements and community milestones
            </p>
          </div>

          <div className="space-y-16">
            {[
              {
                id: '1',
                img: "https://res.cloudinary.com/dceswjquk/image/upload/v1750175044/Event3_v2wk1y.jpg",
                title: "End-of-Year Dividend Distribution Success",
                desc: "Celebrating the successful distribution of end-of-year dividends to our hardworking members, reflecting our commitment to sustainable livelihood and shared economic growth."
              },
              {
                id: '2',
                img: "https://res.cloudinary.com/dceswjquk/image/upload/v1750175046/Event1_sz7aiq.jpg",
                title: "Liwanag ng Kababaihan: Parol-Making Project",
                desc: "Showcasing the creativity and craftsmanship of our members through handcrafted Filipino lanterns that celebrate culture while providing meaningful livelihood opportunities."
              },
              {
                id: '3',
                img: "https://res.cloudinary.com/dceswjquk/image/upload/v1750175047/Event2_gbnda5.png",
                title: "39th Anniversary Milestone",
                desc: "Commemorating nearly four decades of service, empowerment, and community impact with cultural presentations, member recognitions, and product showcases."
              }
            ].map((story, index) => (
              <div
                key={story.id}
                className={`flex flex-col lg:flex-row ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''} items-center gap-8 md:gap-12`}
              >
                {/* Image */}
                <div className="w-full lg:w-1/2">
                  <div className="relative rounded-3xl overflow-hidden shadow-xl group">
                    <img
                      src={story.img}
                      alt={story.title}
                      className="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>

                {/* Content */}
                <div className="w-full lg:w-1/2 text-center lg:text-left">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#df1f47] mb-6">{story.title}</h3>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">{story.desc}</p>
                  <div className="flex items-center gap-2 text-[#df1f47] justify-center lg:justify-start">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Community Achievement</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FooterPublic />
    </div>
  );
};

export default Blog;