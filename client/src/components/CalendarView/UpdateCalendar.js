import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function UpdateCalendar() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [date, setDate] = useState(""); // New state for date
  const [image, setImage] = useState(null); // New state for image URL
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { id } = useParams(); // Get the ID from the URL
  const navigate = useNavigate(); // To navigate after form submission

  useEffect(() => {
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
        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dglawxazg/image/upload', // Replace with your Cloudinary URL
          formData
        );
        const imageUrl = response.data.secure_url;
        setImage(imageUrl); // Set the image URL in state
      } catch (error) {
        console.error('Failed to upload image', error);
        setError("Failed to upload image. Please try again.");
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
      navigate('/app/calendar-list');
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event.');
    }
  };

  return (
    <div className="w-full bg-base-100 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Update Event</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">Start Date</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input input-bordered w-full"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">End Date</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>

        {/* Event Date (Readonly) */}
        <div className="form-control">
          <label className="label">Event Date</label>
          <input
            type="date"
            value={date}
            readOnly
            className="input input-bordered w-full"
            required
          />
        </div>

        {/* Image Upload Field (optional) */}
        <div className="form-control">
          <label className="label">Event Image (Optional)</label>
          <input
            type="file"
            onChange={handleImageChange}
            className="input input-bordered w-full"
            accept="image/*"
          />
        </div>

        <div className="form-control mt-4">
          <button type="submit" className="btn btn-primary w-full">
            Update Event
          </button>
        </div>

        {error && <p className="text-red-500 mt-2">{error}</p>}
        {success && <p className="text-green-500 mt-2">{success}</p>}
      </form>
    </div>
  );
}

export default UpdateCalendar;
