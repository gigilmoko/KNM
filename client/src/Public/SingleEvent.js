import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';
import axios from 'axios';
import { HiCalendar, HiLocationMarker, HiUsers, HiClock  } from "react-icons/hi";

const SingleEvent = () => {
  const { id } = useParams();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/calendar/event/${id}`);
        console.log('Fetched Event:', data);
        if (data.success) {
          setEvent(data.data); // Fix: Use `data.data` to access event details
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  return (
<div className={theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}>
  <HeaderPublic />
  <main className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
    <section className="container mx-auto py-16 flex flex-col items-center gap-10">
      
      {loading ? (
        <p className="text-lg mt-4">Loading event...</p>
      ) : event ? (
        <>
          {/* Event Image Card */}
          <div className="w-[1000px] h-[300px] bg-white text-black dark:bg-gray-800 dark:text-white shadow-lg rounded-lg overflow-hidden">
            <img
              src={event.image || "https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png"}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Event Details Card */}
          <div className="w-[1000px] bg-white text-black dark:bg-gray-800 dark:text-white shadow-lg rounded-lg p-6">
            <h1 className="text-4xl font-bold text-[#df1f47]">{event.title}</h1>
            <p className="mt-4 text-lg">{event.description}</p>

            {/* Start Date */}
            <p className="mt-4 flex items-center gap-2">
              <HiCalendar className="text-[#df1f47] text-xl" />
              <strong>Start:</strong> {new Date(event.startDate).toDateString()} {new Date(event.startDate).toLocaleTimeString()}
            </p>

            {/* End Date */}
            <p className="mt-4 flex items-center gap-2">
              <HiCalendar className="text-[#df1f47] text-xl" />
              <strong>End:</strong> {new Date(event.endDate).toDateString()} {new Date(event.endDate).toLocaleTimeString()}
            </p>

            {/* Location */}
            <p className="mt-4 flex items-center gap-2">
              <HiLocationMarker className="text-[#df1f47] text-xl" />
              <strong>Location:</strong> {event.location}
            </p>

            {/* Audience */}
            <p className="mt-4 flex items-center gap-2">
              <HiUsers className="text-[#df1f47] text-xl" />
              <strong>Audience:</strong> {event.audience === "all" ? "Everyone can join!" : "Members only event!"}
            </p>
          </div>
        </>
      ) : (
        <p className="text-lg mt-4">Event not found.</p>
      )}
    </section>
  </main>
  <FooterPublic />
</div>



  );
  
  
};

export default SingleEvent;
