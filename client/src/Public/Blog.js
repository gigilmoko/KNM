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

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
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
        // handle error
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
    <div className={`min-h-screen flex flex-col ${theme === "dark" ? "bg-gray-900 text-white" : "bg-base-200 text-black"}`}>
      <HeaderPublic />

      {/* Hero Section */}
      <section className="w-full mt-8">
        <div className="w-full min-h-[50vh] px-4 md:px-0 py-16 md:py-24 bg-[#df1f47] text-white flex flex-col items-center justify-center shadow-2xl">
          <h2 className="text-4xl md:text-7xl font-extrabold mb-4 text-center tracking-tight drop-shadow-lg">Our Community Journey</h2>
          <p className="text-lg md:text-2xl mb-10 text-center max-w-2xl font-light">
            Discover the stories of innovation and collaboration that have shaped the organization.
          </p>
          <button
            onClick={handleScrollToBottom}
            className="btn px-8 py-3 text-lg md:text-xl bg-white text-[#df1f47] font-semibold rounded-full shadow hover:bg-gray-200 transition"
          >
            Read More
          </button>
        </div>
      </section>

      {/* Founder Section */}
      <section
        ref={bottomSectionRef}
        className="w-full flex justify-center mb-20 -mt-4 px-2 md:px-4"
      >
        <div className="relative w-full max-w-6xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col md:flex-row p-4 md:p-12 rounded-3xl transition-colors duration-300">
          {/* Founder Image - top left, responsive, bigger */}
          <div className="flex flex-row md:flex-col md:items-start">
            <div className="w-32 h-32 md:w-64 md:h-64 bg-gray-200 rounded-full border-8 border-white dark:border-gray-900 overflow-hidden shadow-2xl mr-6 md:mr-0 md:mb-8 flex-shrink-0">
              <img
                src="https://res.cloudinary.com/dceswjquk/image/upload/v1750175191/beng_slapyt.jpg"
                alt="Ma. Evelina “Beng” Atienza"
                className="w-full h-full object-cover rounded-full"
                style={{ objectPosition: 'center' }}
              />
            </div>
          </div>
          {/* Message */}
          <div className="flex-1 flex flex-col justify-center mt-4 md:mt-0 md:ml-10 text-black dark:text-white">
            <h3 className="text-2xl md:text-3xl font-extrabold mb-4 text-[#df1f47]">
              The Heart Behind the Movement
            </h3>
            <div className="space-y-4 text-sm md:text-base leading-relaxed font-semibold">
              <p>
                Ma. Evelina “Beng” Atienza is the heart behind Kababaihan ng Maynila (KNM) — a woman whose vision, compassion, and belief in women’s strength sparked a movement that continues to change lives.
              </p>
              <p>
                She was inspired by the quiet resilience of everyday women — mothers, wives, daughters — often overlooked by society. “I wanted a space where no woman would feel alone,” she shared. Her dream: women to stand on their own, find their voice, and grow into leaders in their homes and communities.
              </p>
              <p>
                In KNM’s early days, challenges were plenty — limited funds, no space, and skepticism about whether housewives and older women could succeed. But with heart, patience, and the support of a few dedicated members, they pushed through.
              </p>
              <p className="italic">
                “We didn’t have much, but we had heart,” she recalled.
                Today, that heart lives on in every confident member and every handmade product. For Beng, the most rewarding part is seeing women transform from shy learners to empowered creators.
              </p>
              <p>
                “They’re not just members. They’re sisters. And together, they’ve built something beautiful.”
                Her message to future women leaders:
                <span className="block mt-1">“Stay humble. Don’t brag. Share what you have — even the smallest act can make a big difference.”</span>
              </p>
            </div>
            <div className="flex items-center mt-6 space-x-3">
              <div>
                <p className="text-base font-bold">Ma. Evelina “Beng” Atienza</p>
                <p className="text-xs opacity-80">Founder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Pioneers Section */}
      <section className="w-full text-center my-20 px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#df1f47] mb-2">Our Pioneers</h2>
        <h3 className="text-lg md:text-2xl mt-2 text-gray-700 dark:text-gray-200 font-light">
          Meet the early adopters who helped shape our platform and continue to inspire our community with their innovative work.
        </h3>
      </section>

      {/* Pioneers Cards 2x2 */}
      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 px-4 mb-20 max-w-6xl mx-auto">
        {/* Pioneer 1 */}
        <div className="relative w-full p-10 border border-[#df1f47] rounded-3xl shadow-xl bg-white dark:bg-gray-800 text-black dark:text-white">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-gray-200 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden shadow-lg">
            <img
              src="https://res.cloudinary.com/dceswjquk/image/upload/v1750175192/dolores_ypncxj.jpg"
              alt="Dolores Calayag Mescallado"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="pt-20 text-center">
            <p className="text-lg font-bold">Dolores Calayag Mescallado</p>
            <p className="text-sm opacity-80 mb-4">Member since 1987</p>
            <div className="space-y-2 text-sm leading-relaxed font-semibold">
              <p>
                In 1987, Dolores joined KNM as a young mother. What began as a search for livelihood became a journey of lifelong learning and transformation.
              </p>
              <p>
                She became a trainer, teaching others how to make sardines, paper baskets, bonsai plants, and more.
              </p>
              <p>
                “I learned a lot — not just livelihood, but parenting, understanding children, and even teen sexuality,” she shared.
              </p>
              <p>
                Dolores’ 37-year journey with KNM is a powerful story of empowerment, belonging, and giving back — a woman uplifted by her community who now uplifts others.
              </p>
            </div>
          </div>
        </div>
        {/* Pioneer 2 */}
        <div className="relative w-full p-10 border border-[#df1f47] rounded-3xl shadow-xl bg-white dark:bg-gray-800 text-black dark:text-white">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-gray-200 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden shadow-lg">
            <img
              src="https://res.cloudinary.com/dceswjquk/image/upload/v1750175192/Marivic_jgmq7o.jpg"
              alt="Marivic Dela Cruz Valle"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="pt-20 text-center">
            <p className="text-lg font-bold">Marivic Dela Cruz Valle</p>
            <p className="text-sm opacity-80 mb-4">Member since 2001</p>
            <div className="space-y-2 text-sm leading-relaxed font-semibold">
              <p>
                In 2001, Marivic joined KNM at age 30, following her mother’s footsteps. What started as a simple invitation became a meaningful journey of growth.
              </p>
              <p>
                She learned handmade crafts and enjoyed parol-making, which became a source of passive income.
              </p>
              <p>
                “I used to be shy, but I learned to connect with others and eventually got promoted,” she shared.
              </p>
              <p>
                Her advice: “Find your strengths and focus on them. If you keep growing what you're good at, you’ll thrive.”
              </p>
            </div>
          </div>
        </div>
        {/* Pioneer 3 */}
        <div className="relative w-full p-10 border border-[#df1f47] rounded-3xl shadow-xl bg-white dark:bg-gray-800 text-black dark:text-white">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-gray-200 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden shadow-lg">
            <img
              src="https://res.cloudinary.com/dceswjquk/image/upload/v1750175192/Rendy_p7io8b.jpg"
              alt="Rendy Regala"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="pt-20 text-center">
            <p className="text-lg font-bold">Rendy Regala</p>
            <p className="text-sm opacity-80 mb-4">Member since 1996</p>
            <div className="space-y-2 text-sm leading-relaxed font-semibold">
              <p>
                Rendy joined KNM in the late 1990s. She embraced various livelihood skills, especially making kakanin, crafts, and handmade products.
              </p>
              <p>
                “After joining, I developed self-confidence,” she shared. “We attend KNM daily and share stories. I really enjoy creating with others.”
              </p>
              <p>
                Her message: “Always be humble. Don’t brag. If you have a talent, share it — you might inspire someone else.”
              </p>
            </div>
          </div>
        </div>
        {/* Pioneer 4 */}
        <div className="relative w-full p-10 border border-[#df1f47] rounded-3xl shadow-xl bg-white dark:bg-gray-800 text-black dark:text-white">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-gray-200 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden shadow-lg">
            <img
              src="https://res.cloudinary.com/dceswjquk/image/upload/v1750175192/Jehanne_bsaslg.jpg"
              alt="Jehanne Marie Castelo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="pt-20 text-center">
            <p className="text-lg font-bold">Jehanne Marie Castelo</p>
            <p className="text-sm opacity-80 mb-4">Member since 2019</p>
            <div className="space-y-2 text-sm leading-relaxed font-semibold">
              <p>
                Jehanne joined KNM in 2019. In just six years, her life has flourished through her work as a tailor and her bonds with fellow members.
              </p>
              <p>
                “I feel happier,” Jehanne shared. “I get to do tailoring, manage money wisely, and I’m never bored. Everyone shares stories — no one feels alone. We grow together.”
              </p>
              <p>
                Her message: “Stay humble. Volunteer. Help in small ways. Share what you have without expecting anything in return.”
              </p>
            </div>
          </div>
        </div>
      </section>

      <h2 className="text-lg md:text-2xl font-bold italic text-[#df1f47] text-center mb-8 mt-8">
        Join our growing community of innovators and become part of our story
      </h2>

      {/* Featured Events */}
      {loading ? (
        <Loading />
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 mb-16">
          {featuredEvents.map((event) => (
            <div
              className={`rounded-2xl overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
              key={event._id}
            >
              <div className="relative">
                <img
                  src={event.image || 'https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png'}
                  alt={event.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-40 opacity-0 transition-opacity duration-300 hover:opacity-100">
                  <button
                    onClick={() => navigate(`/event/${event._id}`)}
                    className="bg-white text-[#df1f47] border border-[#df1f47] px-4 py-2 text-sm rounded hover:bg-[#df1f47] hover:text-white transition-all duration-300"
                  >
                    View
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>{event.location || 'Unknown Location'}</span>
                  <span className="text-right font-bold text-[#df1f47]">{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="text-lg font-bold text-[#df1f47] font-poppins text-left">{event.title}</div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Example Event Articles at the Bottom */}
      <section className="w-full flex justify-center px-2 md:px-0 mb-20">
        <article className="w-full max-w-full bg-white dark:bg-gray-800 shadow-2xl md:p-10 flex flex-col">
          {[
            {
              id: '1',
              img: "https://res.cloudinary.com/dceswjquk/image/upload/v1750175044/Event3_v2wk1y.jpg",
              title: "End-of-Year Dividend Distribution for Kababaihan ng Maynila Members",
              desc: (
                <>
                  Kababaihan ng Maynila proudly celebrates the successful distribution of end-of-year dividends to its hardworking members. This initiative reflects the organization’s commitment to empowering women through sustainable livelihood and shared economic growth.<br /><br />
                  Each member received a dividend as a result of their collective efforts throughout the year — from producing and selling handcrafted goods to participating in various community-driven projects. These earnings provide significant financial support to the members and their families, especially during the holiday season.<br /><br />
                  This milestone highlights the value of unity, dedication, and the importance of supporting local women-led initiatives. Kababaihan ng Maynila extends its gratitude to everyone who contributed to making this achievement possible.
                </>
              )
            },
            {
              id: '2',
              img: "https://res.cloudinary.com/dceswjquk/image/upload/v1750175046/Event1_sz7aiq.jpg",
              title: "Liwanag ng Kababaihan: Parol-Making Project",
              desc: (
                <>
                  Kababaihan ng Maynila proudly presents a parol-making project that showcases the creativity and craftsmanship of its members. This initiative aims to celebrate Filipino culture while providing a meaningful outlet for artistic expression and livelihood.<br /><br />
                  Each parol was carefully handcrafted by the members, who collectively invested in sourcing quality materials and dedicated time and effort to produce unique, vibrant designs. The project reflects the women’s resourcefulness, talent, and commitment to empowering one another through shared opportunities.<br /><br />
                  The public is invited to support and appreciate this inspiring display of handmade Filipino lanterns — symbols of light, unity, and the enduring spirit of community.
                </>
              )
            },
            {
              id: '3',
              img: "https://res.cloudinary.com/dceswjquk/image/upload/v1750175047/Event2_gbnda5.png",
              title: "39th Anniversary of Kababaihan ng Maynila",
              desc: (
                <>
                  Kababaihan ng Maynila marks its 39th anniversary, celebrating nearly four decades of service, empowerment, and community impact. Since its founding, the organization has grown into a strong network of women committed to uplifting one another through livelihood, leadership, and shared advocacy.<br /><br />
                  This milestone highlights the dedication of its members and leaders, past and present, who have contributed to the group’s continued success. The anniversary celebration includes cultural presentations, member recognitions, and a showcase of handcrafted products.<br /><br />
                  The public is invited to join in commemorating this special occasion and to honor the legacy and future of Kababaihan ng Maynila.
                </>
              )
            }
          ].map((event, idx) => (
            <div
              key={event.id}
              className={`flex flex-col md:flex-row ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''} items-center md:items-stretch gap-6 md:gap-10`}
            >
              {/* Image */}
              <div className="w-full md:w-1/2 flex-shrink-0 flex items-center px-2 md:px-6">
                <div className="w-full h-60 md:h-80 rounded-2xl overflow-hidden shadow-lg bg-gray-100 mx-auto md:mx-0">
                  <img
                    src={event.img}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Content */}
              <div className="w-full md:w-1/2 flex flex-col justify-center p-4 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#df1f47]">{event.title}</h2>
                <div className="text-base md:text-lg font-light leading-relaxed">{event.desc}</div>
              </div>
            </div>
          ))}
        </article>
      </section>

      <FooterPublic />
    </div>
  );
};

export default Blog;