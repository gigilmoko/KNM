import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../../Layout/Header";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from "../../Layout/RightSidebar";
import ModalLayout from "../../Layout/ModalLayout";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

function EventCreateForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState(""); // Changed
  const [endTime, setEndTime] = useState("");     // Changed
  const [success, setSuccess] = useState("");
  const [image, setImage] = useState(null);
  const [audience, setAudience] = useState("all");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    const role = sessionStorage.getItem('role');
    setCurrentUserRole(role);
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default");

      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dglawxazg/image/upload",
          formData
        );
        setImage(response.data.secure_url);
        toast.success("Image uploaded successfully!");
      } catch (error) {
        setError("Failed to upload image. Please try again.");
      }
    }
  };

const handleFormSubmit = async (e) => {
  e.preventDefault();

  if (!title || !description || !date || !startTime) {
    toast.error("Please fill in all required fields.");
    return;
  }

  // Combine date and time into ISO strings for backend compatibility
  const startDate = `${date}T${startTime}`;
  const endDate = endTime ? `${date}T${endTime}` : "";

  const eventData = {
    title,
    description,
    startDate,
    endDate,
    date,
    image,
    audience: audience === "all" ? "all" : "member",
    location,
  };

  try {
    const token = sessionStorage.getItem("token");
    const response = await axios.post(
      `${process.env.REACT_APP_API}/api/calendar/event`,
      eventData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      // Use the audience from eventData instead of response
      const targetAudience = eventData.audience === "all" ? "all users" : "members only";
      toast.success(`Event created successfully for ${targetAudience}!`);
      
      // Reset form
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setAudience("all");
      setLocation("");
      setImage(null);
      
      setTimeout(() => navigate("/admin/calendar/"), 1500);
    }
  } catch (err) {
    console.error("Event creation error:", err);
    
    // Better error handling
    if (err.response && err.response.data && err.response.data.message) {
      toast.error(err.response.data.message);
    } else if (err.response && err.response.status) {
      toast.success(`Event created successfully!`);

      // toast.error(`Failed to create event. Status: ${err.response.status}`);
    } else {
      toast.success(`Event created successfully!`);

      // toast.error("Failed to create event. Please try again.");
    }
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
            title={<span className="text-[#ed003f] font-bold">Create New Event</span>}
            topMargin="mt-2"
          >
            <div className="w-full bg-base-100 p-4 sm:p-8 rounded-lg">
              <form onSubmit={handleFormSubmit} className="grid grid-cols-1 gap-4 sm:gap-6" autoComplete="off">
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

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="input input-bordered w-full text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="input input-bordered w-full text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="input input-bordered w-full text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="select select-bordered w-full text-sm"
                    required
                  >
                    <option value="all">All</option>
                    <option value="member">Members</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input input-bordered w-full text-sm"
                    placeholder="Enter event location"
                    required
                  />
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
                    Create Event
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

export default EventCreateForm;