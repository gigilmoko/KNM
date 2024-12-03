import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../Layout/Header";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from "../../Layout/RightSidebar";
import ModalLayout from "../../Layout/ModalLayout";
import TitleCard from "../../Layout/components/Cards/TitleCard"; 
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


function UpdateCalendar() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [date, setDate] = useState("");
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState("");
  const [audience, setAudience] = useState("all");
  const [error, setError] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/calendar/event/${id}`);
        const event = response.data.data;
  
        const formatDateTime = (dateTime) => {
          const dateObj = new Date(dateTime);
          return dateObj.toISOString().slice(0, 16); // Formats to `YYYY-MM-DDTHH:mm`
        };
  
        // Update state with fetched and formatted data
        setTitle(event.title || "");
        setDescription(event.description || "");
        setStartDate(event.startDate ? formatDateTime(event.startDate) : "");
        setEndDate(event.endDate ? formatDateTime(event.endDate) : "");
        setDate(event.date || ""); // Assuming event.date is already a valid date format
        setImage(event.image || null);
        setLocation(event.location || "");
        setAudience(event.audience || "all");
      } catch (error) {
        console.error("Error fetching event data:", error);
        setError("Failed to load event data.");
      }
    };
  
    fetchEventData();
  }, [id]);
  

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default");

      try {
        const response = await axios.post("https://api.cloudinary.com/v1_1/dglawxazg/image/upload", formData);
        setImage(response.data.secure_url);
      } catch (error) {
        console.error("Failed to upload image", error);
        setError("Failed to upload image. Please try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const eventData = { date, title, description, startDate, endDate, image, location, audience };
  
    try {
      await axios.put(`${process.env.REACT_APP_API}/api/calendar/event/${id}`, eventData);
  
      // Success toast
      toast.success(`Event updated successfully for ${audience === "all" ? "all users" : "members only"}!`);
  
      navigate("/admin/calendar/");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event.");
    }
  };
  

  return (
    <div className="drawer lg:drawer-open">
      <ToastContainer />
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200">
          <TitleCard title="Update Event" topMargin="mt-2">
            <div className="w-full bg-base-100 p-4 rounded-lg">
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

                <div className="form-control">
                  <label className="label">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="select select-bordered w-full"
                  >
                    <option value="all">All</option>
                    <option value="member">Members</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">Event Image (Optional)</label>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="input input-bordered w-full"
                    accept="image/*"
                  />
                  {image && <img src={image} alt="Event" className="mt-2 w-32 h-32 object-cover" />}
                </div>

                <div className="form-control mt-4">
                  <button type="submit" className="btn btn-primary w-full">
                    Update Event
                  </button>
                </div>

                {error && <p className="text-red-500 mt-2">{error}</p>}
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

export default UpdateCalendar;
