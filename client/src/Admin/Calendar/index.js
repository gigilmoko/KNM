import { useEffect, useState } from "react";
import ChevronLeftIcon from "@heroicons/react/24/solid/ChevronLeftIcon";
import ChevronRightIcon from "@heroicons/react/24/solid/ChevronRightIcon";
import moment from "moment";
import axios from "axios";
import { CALENDAR_EVENT_STYLE, getRandomEventColorClass } from "./util";
import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import { useNavigate } from "react-router-dom";
import { RIGHT_DRAWER_TYPES } from "../../utils/globalConstantUtil";
import { useDispatch } from 'react-redux';
import { openRightDrawer } from "../../Layout/common/rightDrawerSlice";

const THEME_BG = CALENDAR_EVENT_STYLE;

function CalendarView() {
  const today = moment().startOf('day');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const colStartClasses = [
    "",
    "col-start-2",
    "col-start-3",
    "col-start-4",
    "col-start-5",
    "col-start-6",
    "col-start-7",
  ];

  const [firstDayOfMonth, setFirstDayOfMonth] = useState(moment().startOf('month'));
  const [events, setEvents] = useState([]);
  const [currMonth, setCurrMonth] = useState(() => moment(today).format("MMM-yyyy"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      const apiUrl = `${process.env.REACT_APP_API}/api/calendar/events`;
      try {
        const response = await axios.get(apiUrl);
        console.log('Fetched events:', response.data.data); // Debug log
        setEvents(response.data.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events.');
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const allDaysInMonth = () => {
    let start = moment(firstDayOfMonth).startOf('week');
    let end = moment(moment(firstDayOfMonth).endOf('month')).endOf('week');
    const days = [];
    let day = start;
    while (day <= end) {
      days.push(day.toDate());
      day = day.clone().add(1, 'd');
    }
    return days;
  };

  const handleAddNewEvent = () => {
    navigate('/admin/calendar/new');
  };

  const getEventsForCurrentDate = (date) => {
    let filteredEvents = events.filter((e) => moment(date).isSame(moment(e.startDate), 'day'));
    if (filteredEvents.length > 2) {
      let originalLength = filteredEvents.length;
      filteredEvents = filteredEvents.slice(0, 2);
      filteredEvents.push({ title: `${originalLength - 2} more`, theme: "MORE", isMoreButton: true });
    }
    return filteredEvents;
  };

  // Updated function to handle both individual events and "more" button
  const handleEventClick = (event, date) => {
    console.log('Event clicked:', event); // Debug log
    
    if (event.isMoreButton) {
      // If it's the "more" button, show all events for that day in sidebar
      let filteredEvents = events.filter((e) => moment(date).isSame(moment(e.startDate), 'day'));
      console.log('Opening all events for date:', date, 'Events:', filteredEvents); // Debug log
      openDayDetail({ filteredEvents, title: moment(date).format("D MMM YYYY") });
    } else {
      // If it's a regular event, navigate to event details
      const eventId = event._id || event.id;
      if (eventId) {
        navigate(`/admin/calendar/info/${eventId}`);
      } else {
        console.error('No valid event ID found:', event);
      }
    }
  };

  const openDayDetail = ({ filteredEvents, title }) => {
    console.log('Opening day detail with events:', filteredEvents); // Debug log
    dispatch(openRightDrawer({ 
      header: title, 
      bodyType: RIGHT_DRAWER_TYPES.CALENDAR_EVENTS, 
      extraObject: { filteredEvents } 
    }));
  };

  const isToday = (date) => moment(date).isSame(moment(), 'day');
  const isDifferentMonth = (date) => moment(date).month() !== moment(firstDayOfMonth).month();

  const getPrevMonth = () => {
    const firstDayOfPrevMonth = moment(firstDayOfMonth).add(-1, 'M').startOf('month');
    setFirstDayOfMonth(firstDayOfPrevMonth);
    setCurrMonth(moment(firstDayOfPrevMonth).format("MMM-yyyy"));
  };

  const getCurrentMonth = () => {
    const firstDayOfCurrMonth = moment().startOf('month');
    setFirstDayOfMonth(firstDayOfCurrMonth);
    setCurrMonth(moment(firstDayOfCurrMonth).format("MMM-yyyy"));
  };

  const getNextMonth = () => {
    const firstDayOfNextMonth = moment(firstDayOfMonth).add(1, 'M').startOf('month');
    setFirstDayOfMonth(firstDayOfNextMonth);
    setCurrMonth(moment(firstDayOfNextMonth).format("MMM-yyyy"));
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 bg-base-100">
          <div className="w-full bg-base-100 p-2 sm:p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <p className="font-semibold text-lg sm:text-xl w-auto text-[#ed003f]">
                  {moment(firstDayOfMonth).format("MMMM yyyy")}
                </p>
                <button className="btn btn-square btn-xs sm:btn-sm btn-ghost text-[#ed003f]" onClick={getPrevMonth}>
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button className="btn btn-xs sm:btn-sm btn-ghost normal-case text-[#ed003f] border border-[#ed003f] hover:bg-[#ed003f] hover:text-white transition" onClick={getCurrentMonth}>
                  Current Month
                </button>
                <button className="btn btn-square btn-xs sm:btn-sm btn-ghost text-[#ed003f]" onClick={getNextMonth}>
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
              <div>
                <button
                  className="btn btn-xs sm:btn-sm bg-[#ed003f] text-white font-bold border-none hover:bg-red-700 transition normal-case"
                  onClick={handleAddNewEvent}
                >
                  Add New Event
                </button>
              </div>
            </div>
            <div className="my-4 divider" />
            <div className="grid grid-cols-7 gap-2 sm:gap-6 place-items-center">
              {weekdays.map((day, key) => (
                <div className="text-xs capitalize font-semibold text-[#ed003f]" key={key}>
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 mt-1 place-items-center gap-1 sm:gap-2">
              {allDaysInMonth().map((day, idx) => {
                const eventsForDay = getEventsForCurrentDate(day);
                return (
                  <div
                    key={idx}
                    className={`${colStartClasses[moment(day).day()]} border border-solid w-full h-20 sm:h-28 rounded-md bg-white shadow-sm transition`}
                  >
                    <p
                      className={`inline-block flex items-center justify-center h-8 w-8 rounded-full mx-1 mt-1 text-sm transition
                        ${isToday(day) ? "bg-[#ed003f] text-white" : ""}
                        ${isDifferentMonth(day) ? "text-slate-400 dark:text-slate-600" : "text-[#ed003f]"}
                        ${eventsForDay.length > 0 ? "cursor-pointer hover:bg-[#ed003f] hover:text-white" : ""}
                      `}
                      style={eventsForDay.length === 0 ? { pointerEvents: "none" } : {}}
                      onClick={eventsForDay.length > 0 ? () => {
                        const dayEvents = events.filter((e) => moment(day).isSame(moment(e.startDate), 'day'));
                        console.log('Day clicked, events:', dayEvents); // Debug log
                        openDayDetail({
                          filteredEvents: dayEvents,
                          title: moment(day).format("D MMM YYYY")
                        });
                      } : undefined}
                    >
                      {moment(day).format("D")}
                    </p>
                    {eventsForDay.map((e, k) => (
                      <p
                        key={k}
                        onClick={(event) => {
                          event.stopPropagation(); // Prevent triggering the day click
                          handleEventClick(e, day);
                        }}
                        className={`text-xs px-2 mt-1 truncate rounded cursor-pointer hover:opacity-80 transition-opacity
                          ${e.isMoreButton
                            ? "bg-[#ed003f] text-white font-semibold"
                            : getRandomEventColorClass()
                          }`}
                        style={{ maxWidth: "90%" }}
                        title={e.title} // Show full title on hover
                      >
                        {e.title}
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>

            {loading && <p className="text-center mt-4">Loading...</p>}
            {error && <p className="text-center text-red-500 mt-4">{error}</p>}
          </div>
        </main>
      </div>
      <LeftSidebar />
      <RightSidebar />
      <ModalLayout />
    </div>
  );
}

export default CalendarView;