import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import bg from '../../assets/img/bg-01.jpg';
import '../../assets/css/user.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

// Set up the localizer for react-big-calendar using moment
const localizer = momentLocalizer(moment);

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
        setEvents(response.data.data.map(event => ({
          ...event,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
        })));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events.');
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const onSelectEvent = (event) => {
    console.log('Event clicked:', event); // Log the clicked event

    setSelectedDate(event.start);
    setSelectedEvents([event]);
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
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '600px' }} // Adjust the height as needed
              onSelectEvent={onSelectEvent}
            />
          )}

          {selectedDate && selectedEvents.length > 0 && (
            <div className="selected-events">
              <h2>Events on {moment(selectedDate).format('MMMM D, YYYY')}</h2>
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
                      <td>{moment(event.start).format('MMMM D, YYYY h:mm A')}</td>
                      <td>{moment(event.end).format('MMMM D, YYYY h:mm A')}</td>
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
