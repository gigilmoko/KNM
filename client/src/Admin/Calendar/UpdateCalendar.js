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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  const getProfile = async () => {
    const config = {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      },
    };
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
      setUser(data.user);
      setLoading(false);
    } catch (error) {
      setError('Failed to load profile.');
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
    const fetchEventData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/calendar/event/${id}`);
        const event = response.data.data;

        const formatDateTime = (dateTime) => {
          const dateObj = new Date(dateTime);
          return dateObj.toISOString().slice(0, 16); // Formats to `YYYY-MM-DDTHH:mm`
        };

        setTitle(event.title || "");
        setDescription(event.description || "");
        setStartDate(event.startDate ? formatDateTime(event.startDate) : "");
        setEndDate(event.endDate ? formatDateTime(event.endDate) : "");
        setDate(event.date || "");
        setImage(event.image || null);
        setLocation(event.location || "");
        setAudience(event.audience || "all");
      } catch (error) {
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
        setError("Failed to upload image. Please try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    const eventData = { date, title, description, startDate, endDate, image, location, audience };

    try {
      await axios.put(`${process.env.REACT_APP_API}/api/calendar/event/${id}`, eventData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(`Event updated successfully for ${audience === "all" ? "all users" : "members only"}!`);
      setTimeout(() => {
        navigate("/admin/calendar/");
      }, 1500);
    } catch (error) {
      toast.error("Failed to update event.");
    }
  };

  return (
    <div className="drawer lg:drawer-open">
      <ToastContainer />
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-base-200">
          <TitleCard
            title={<span className="text-[#ed003f] font-bold">Update Event</span>}
            topMargin="mt-2"
          >
            <div className="w-full bg-base-100 p-4 sm:p-8 rounded-lg">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:gap-6" autoComplete="off">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input input-bordered w-full text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="textarea textarea-bordered w-full text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="input input-bordered w-full text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="input input-bordered w-full text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input input-bordered w-full text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="select select-bordered w-full text-sm"
                  >
                    <option value="all">All</option>
                    <option value="member">Members</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Event Image (Optional)</label>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="file-input file-input-bordered w-full text-sm"
                    accept="image/*"
                    style={{
                      background: 'transparent',
                      border: '1px solid #ed003f',
                      color: '#ed003f',
                      boxShadow: 'none'
                    }}
                  />
                  {image && <img src={image} alt="Event" className="mt-2 w-24 h-24 sm:w-32 sm:h-32 object-cover rounded" />}
                </div>

                <div className="mt-2 sm:mt-4">
                  <button
                    type="submit"
                    className="btn w-full text-base font-semibold bg-[#ed003f] text-white border-none hover:bg-red-700 transition"
                  >
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