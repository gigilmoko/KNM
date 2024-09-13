import { useEffect, useState } from "react";
import ChevronLeftIcon from "@heroicons/react/24/solid/ChevronLeftIcon";
import ChevronRightIcon from "@heroicons/react/24/solid/ChevronRightIcon";
import moment from "moment";
import { CALENDAR_EVENT_STYLE, getRandomEventColorClass } from "./util"; // Ensure correct path
import axios from "axios";
const THEME_BG = CALENDAR_EVENT_STYLE
function CalendarView({ addNewEvent, openDayDetail }) {
  const today = moment().startOf('day');
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
      console.log('API URL:', apiUrl);

      try {
        const response = await axios.get(apiUrl);
        console.log('Fetched Data:', response.data);
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

  const getEventsForCurrentDate = (date) => {
    let filteredEvents = events.filter((e) => moment(date).isSame(moment(e.startDate), 'day'));
    if (filteredEvents.length > 2) {
      let originalLength = filteredEvents.length;
      filteredEvents = filteredEvents.slice(0, 2);
      filteredEvents.push({ title: `${originalLength - 2} more`, theme: "MORE" });
    }
    return filteredEvents;
  };

  const openAllEventsDetail = (date, theme) => {
    if (theme !== "MORE") return;
    let filteredEvents = events.filter((e) => moment(date).isSame(moment(e.startDate), 'day'))
      .map((e) => ({ title: e.title, theme: e.theme }));
    openDayDetail({ filteredEvents, title: moment(date).format("D MMM YYYY") });
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
    <div className="w-full bg-base-100 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex justify-normal gap-2 sm:gap-4">
          <p className="font-semibold text-xl w-48">
            {moment(firstDayOfMonth).format("MMMM yyyy").toString()}<span className="text-xs ml-2"></span>
          </p>

          <button className="btn btn-square btn-sm btn-ghost" onClick={getPrevMonth}>
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <button className="btn btn-sm btn-ghost normal-case" onClick={getCurrentMonth}>
            Current Month
          </button>
          <button className="btn btn-square btn-sm btn-ghost" onClick={getNextMonth}>
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
        <div>
          <button className="btn btn-sm btn-ghost btn-outline normal-case" onClick={addNewEvent}>Add New Event</button>
        </div>
      </div>
      <div className="my-4 divider" />
      <div className="grid grid-cols-7 gap-6 sm:gap-12 place-items-center">
        {weekdays.map((day, key) => (
          <div className="text-xs capitalize" key={key}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 mt-1 place-items-center">
        {allDaysInMonth().map((day, idx) => (
          <div key={idx} className={`${colStartClasses[moment(day).day()]} border border-solid w-full h-28`}>
            <p className={`inline-block flex items-center justify-center h-8 w-8 rounded-full mx-1 mt-1 text-sm cursor-pointer hover:bg-base-300 ${isToday(day) ? "bg-blue-100 dark:bg-blue-400 dark:hover:bg-base-300 dark:text-white" : ""} ${isDifferentMonth(day) ? "text-slate-400 dark:text-slate-600" : ""}`} onClick={() => addNewEvent(day)}>
              {moment(day).format("D")}
            </p>
            {getEventsForCurrentDate(day).map((e, k) => (
              <p key={k} onClick={() => openAllEventsDetail(day, e.theme)} className={`text-xs px-2 mt-1 truncate ${e.theme === "MORE" ? THEME_BG[e.theme] : getRandomEventColorClass()}`}>
                {e.title}
              </p>
            ))}
          </div>
        ))}
      </div>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
    </div>
  );
}

export default CalendarView;
