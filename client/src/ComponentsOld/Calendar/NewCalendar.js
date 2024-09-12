import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/user.css'; // Ensure this path is correct
import bg from '../../assets/img/bg-01.jpg';

const NewCalendar = () => {
  // Set today's date for the initial state
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [image, setImage] = useState(''); // URL of the uploaded image
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

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
      } catch (error) {
        console.error('Failed to upload image', error);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_API}/api/calendar/event`, {
        date,
        title,
        description,
        startDate,
        endDate,
        image
      });

      setSuccess('Event created successfully.');
      setError('');
      navigate('/all-calendar');
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event.');
    }
  };

  return (
    <div className="limiter">
      <div className="container-login100" style={{ backgroundImage: `url(${bg})` }}>
        <div className="wrap-login1000 p-l-30 p-r-30 p-t-65 p-b-54">
          <h1 className="form-title">New Calendar Event</h1>
          <form onSubmit={handleSubmit}>
            <div className="wrap-input100 validate-input m-b-23">
              <span className="label-input100">Date:</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input100"
                disabled
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
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input100"
              />
            </div>
            <button type="submit" className="login100-form-btn">Create Event</button>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewCalendar;
