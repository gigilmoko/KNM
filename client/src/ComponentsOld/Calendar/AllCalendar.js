import React, { useState, useEffect } from 'react';
import axios from 'axios';
import bg from '../../assets/img/bg-01.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faBell } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const AllCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [filteredEvents, setFilteredEvents] = useState({ past: [], ongoing: [] });
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const apiUrl = `${process.env.REACT_APP_API}/api/calendar/events`;
      console.log('API URL:', apiUrl); // Log the URL being used

      try {
        const response = await axios.get(apiUrl);
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

  useEffect(() => {
    const checkForUpcomingEvents = () => {
      const now = new Date();
      events.forEach(event => {
        const startDate = new Date(event.startDate);
        if (
          startDate.getFullYear() === now.getFullYear() &&
          startDate.getMonth() === now.getMonth() &&
          startDate.getDate() === now.getDate() &&
          startDate.getHours() === now.getHours() &&
          startDate.getMinutes() === now.getMinutes()
        ) {
          setNotification(`Event "${event.title}" is happening now!`);
          setTimeout(() => setNotification(''), 5000);
        }
      });
    };

    const interval = setInterval(() => {
      checkForUpcomingEvents();
      setCurrentTime(new Date().toLocaleString()); // Update the current time every second
    }, 1000);

    return () => clearInterval(interval);
  }, [events]);

  const handleEdit = (id) => {
    navigate(`/calendar/update-event/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API}/api/calendar/event/${id}`);
      setEvents(events.filter(event => event._id !== id));
      console.log('Deleted event with ID:', id);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleNewEvent = () => {
    navigate('/calendar/new-event');
  };

  const filterEvents = () => {
    const now = new Date();
  
    const pastEvents = events.filter(event => {
      const endDate = new Date(event.endDate);
      return endDate < now;
    });
  
    const ongoingEvents = events.filter(event => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      return startDate <= now && endDate >= now;
    });
  
    console.log('Past Events:', pastEvents);
    console.log('Ongoing Events:', ongoingEvents);
  
    if (pastEvents.length === 0 && ongoingEvents.length === 0) {
      console.log('No past or ongoing events found.');
    }
  
    setFilteredEvents({ past: pastEvents, ongoing: ongoingEvents });
  };
  
  return (
    <div className="limiter">
      <div className="container-login100" style={{ backgroundImage: `url(${bg})` }}>
        <div className="wrap-login1000 p-l-30 p-r-30 p-t-65 p-b-54">
          <div className="header-actions">
            <button onClick={handleNewEvent} className="btn-new-event">
              New Calendar Event
            </button>
            <button onClick={filterEvents} className="btn-filter-events">
              Show Ongoing or Past Events
            </button>
          </div>
          <h1 className="table-title">All Calendar Events</h1>
          <table className="event-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Description</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id}>
                  <td>{new Date(event.date).toLocaleDateString()}</td>
                  <td>{event.title}</td>
                  <td>{event.description}</td>
                  <td>{new Date(event.startDate).toLocaleString()}</td>
                  <td>{new Date(event.endDate).toLocaleString()}</td>
                  <td>
                    {event.image && <img src={event.image} alt={event.title} className="event-image" />}
                  </td>
                  <td>
                    <button onClick={() => handleEdit(event._id)} className="btn-action">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button onClick={() => handleDelete(event._id)} className="btn-action">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p>Loading events...</p>}
          {error && <p className="error-message">{error}</p>}
          {notification && (
            <div className="notification">
              <FontAwesomeIcon icon={faBell} /> {notification}
            </div>
          )}
          <div className="filtered-events">
            {filteredEvents.ongoing.length > 0 && (
              <>
                <h2>Ongoing Events</h2>
                <table className="event-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Image</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.ongoing.map((event) => (
                      <tr key={event._id}>
                        <td>{new Date(event.date).toLocaleDateString()}</td>
                        <td>{event.title}</td>
                        <td>{event.description}</td>
                        <td>{new Date(event.startDate).toLocaleString()}</td>
                        <td>{new Date(event.endDate).toLocaleString()}</td>
                        <td>
                          {event.image && <img src={event.image} alt={event.title} className="event-image" />}
                        </td>
                        <td>
                          <button onClick={() => handleEdit(event._id)} className="btn-action">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button onClick={() => handleDelete(event._id)} className="btn-action">
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            {filteredEvents.past.length > 0 && (
              <>
                <h2>Past Events</h2>
                <table className="event-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Image</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.past.map((event) => (
                      <tr key={event._id}>
                        <td>{new Date(event.date).toLocaleDateString()}</td>
                        <td>{event.title}</td>
                        <td>{event.description}</td>
                        <td>{new Date(event.startDate).toLocaleString()}</td>
                        <td>{new Date(event.endDate).toLocaleString()}</td>
                        <td>
                          {event.image && <img src={event.image} alt={event.title} className="event-image" />}
                        </td>
                        <td>
                          <button onClick={() => handleEdit(event._id)} className="btn-action">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button onClick={() => handleDelete(event._id)} className="btn-action">
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
          <div className="current-time">
            <p>Current Time: {currentTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCalendar;
