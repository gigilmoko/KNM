import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../Layout/Header";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from "../../Layout/RightSidebar";
import ModalLayout from "../../Layout/ModalLayout";
import TitleCard from "../../Layout/components/Cards/TitleCard"; // Assuming TitleCard is used for form titles
import { useNavigate } from "react-router-dom"

function EventCreateForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [date, setDate] = useState(""); // New state for date
  const [image, setImage] = useState(null); // New state for image URL
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Set today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  // Function to handle image upload to Cloudinary
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
        setError("Failed to upload image. Please try again.");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous messages
    setError("");
    setSuccess("");

    // Prepare event data
    const eventData = {
      title,
      description,
      startDate,
      endDate,
      date,
      image // Use the image URL
    };

    // Log the form data for debugging
    console.log("Submitted Data:");
    console.log(eventData);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API}/api/calendar/event`, eventData);

      if (response.data) {
        setSuccess("Event created successfully!");
        // Clear form after submission
        setTitle("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        // setImage(null);
        navigate('/admin/calendar/'); 
      }
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event. Please try again.");
    }
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200">
          <TitleCard title="Create New Event" topMargin="mt-2">
            <div className="w-full bg-base-100 p-4 rounded-lg">
              <form onSubmit={handleFormSubmit} className="space-y-4">
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
                    Create Event
                  </button>
                </div>

                {error && <p className="text-red-500 mt-2">{error}</p>}
                {success && <p className="text-green-500 mt-2">{success}</p>}
              </form>
            </div>
          </TitleCard>
        </main>
      </div>
      <LeftSidebar />
      <RightSidebar />
      <ModalLayout />
    </div>
  );
}

export default EventCreateForm;
