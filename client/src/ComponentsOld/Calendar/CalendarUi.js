import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar'; // We'll use this package for the calendar UI
import 'react-calendar/dist/Calendar.css'; // Import the default styles
import bg from '../../assets/img/bg-01.jpg';
import '../../assets/css/user.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const CalendarUi = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/calendar/events`);
        setEvents(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const normalizeDate = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const eventDates = events.map(event => normalizeDate(new Date(event.startDate)).toDateString());
      if (eventDates.includes(normalizeDate(date).toDateString())) {
        return 'event-day'; // Add this class if there's an event on this date
      }
    }
    return null;
  };

  const onClickDay = (date) => {
    const normalizedDate = normalizeDate(date);
    console.log('Date clicked:', normalizedDate.toDateString()); // Log the clicked date

    const eventsOnThisDay = events.filter(event =>
      normalizeDate(new Date(event.startDate)).toDateString() === normalizedDate.toDateString()
    );

    console.log('Events on this date:', eventsOnThisDay); // Log the events found on this date

    setSelectedDate(normalizedDate);
    setSelectedEvents(eventsOnThisDay);
  };

  const handleEdit = (id) => {
    // Implement edit functionality as per your requirements
  };

  const handleDelete = async (id) => {
    // Implement delete functionality as per your requirements
  };

  const handleNewEvent = () => {
    // Implement functionality to add a new event
  };

  return (
    <div className="limiter">
      <div className="container-login100" style={{ backgroundImage: `url(${bg})` }}>
        <div className="wrap-login1000 p-l-30 p-r-30 p-t-65 p-b-54">
        

          {loading && <p>Loading events...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && !error && (
            <Calendar
              tileClassName={getTileClassName}
              onClickDay={onClickDay}
            />
          )}

          {selectedDate && selectedEvents.length > 0 && (
            <div className="selected-events">
              <h2>Events on {selectedDate.toDateString()}</h2>
              <table className="event-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Image</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedEvents.map(event => (
                    <tr key={event._id}>
                      <td>{event.title}</td>
                      <td>{event.description}</td>
                      <td>{new Date(event.startDate).toLocaleString()}</td>
                      <td>{new Date(event.endDate).toLocaleString()}</td>
                      <td>
                        {event.image && <img src={event.image} alt={event.title} className="event-image" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarUi;
