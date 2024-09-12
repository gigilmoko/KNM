import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../../assets/css/user.css';
import bg from '../../assets/img/bg-01.jpg';

const UpdateCalendar = () => {
  const { id } = useParams(); // Get the event ID from the URL
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null); // For new image uploads
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the event data based on ID
    const fetchEventData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/calendar/event/${id}`);
        const event = response.data.data; // Access the event data

        // Format the dates to match the datetime-local input format
        const formatDateTime = (dateTime) => {
          const [date, time] = dateTime.split('T');
          return `${date}T${time.slice(0, 5)}`; // Keep only hours and minutes
        };

        // Set the state with the fetched data
        setDate(event.date.split('T')[0]); // Format date as YYYY-MM-DD
        setTitle(event.title);
        setDescription(event.description);
        setStartDate(formatDateTime(event.startDate));
        setEndDate(formatDateTime(event.endDate));
        setImage(event.image);
        console.log("Fetched event data:", event);
      } catch (error) {
        console.error('Error fetching event data:', error);
        setError('Failed to load event data.');
      }
    };

    fetchEventData();
  }, [id]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default'); // Replace with your Cloudinary upload preset

      try {
        // Upload file to Cloudinary
        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dglawxazg/image/upload', // Replace with your Cloudinary URL
          formData
        );
        const imageUrl = response.data.secure_url;
        setImage(imageUrl); // Set the image URL in state
        setImageFile(file); // Keep track of the new image file
      } catch (error) {
        console.error('Failed to upload image', error);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const response = await axios.put(`${process.env.REACT_APP_API}/api/calendar/event/${id}`, {
        date,
        title,
        description,
        startDate,
        endDate,
        image
      });

      setSuccess('Event updated successfully.');
      setError('');
      console.log('Event updated successfully:', response.data);

      // Redirect to another location if needed
      navigate('/calendar/events');
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event.');
    }
  };

  return (
    <div className="limiter">
      <div className="container-login100" style={{ backgroundImage: `url(${bg})` }}>
        <div className="wrap-login1000 p-l-30 p-r-30 p-t-65 p-b-54">
          <h1 className="form-title">Update Calendar Event</h1>
          <form onSubmit={handleSubmit}>
            <div className="wrap-input100 validate-input m-b-23">
              <span className="label-input100">Date:</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input100"
              />
            </div>
            <div className="wrap-input100 validate-input m-b-23">
              <span className="label-input100">Title:</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input100"
                required
              />
            </div>
            <div className="wrap-input100 validate-input m-b-23">
              <span className="label-input100">Description:</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input100"
              />
            </div>
            <div className="wrap-input100 validate-input m-b-23">
              <span className="label-input100">Start Date:</span>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input100"
                required
              />
            </div>
            <div className="wrap-input100 validate-input m-b-23">
              <span className="label-input100">End Date:</span>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input100"
                required
              />
            </div>
            <div className="wrap-input100 validate-input m-b-23">
              <span className="label-input100">Image:</span>
              {image && (
                <div className="image-preview">
                  <img src={image} alt="Event" className="preview-image" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input100"
              />
            </div>
            <button type="submit" className="login100-form-btn">Update Event</button>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateCalendar;
