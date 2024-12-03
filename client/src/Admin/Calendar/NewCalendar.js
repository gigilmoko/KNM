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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [date, setDate] = useState("");
  const [success, setSuccess] = useState("");
  const [image, setImage] = useState(null);
  const [audience, setAudience] = useState("all");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);

    // Get current user role (you might want to get this from sessionStorage or an API)
    const role = sessionStorage.getItem('role'); // or get from API
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
        console.error("Image upload failed:", error);
        setError("Failed to upload image. Please try again.");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !startDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

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
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/calendar/event`,
        eventData
      );
      if (response.data.success) {
        const targetAudience = response.data.audience;
        if (targetAudience === "all" || (targetAudience === "members" && currentUserRole === "member")) {
          toast.success(`Event created successfully for ${targetAudience}!`);
        }
        setTitle("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setAudience("all"); // Reset audience to default
        setLocation("");
        setImage(null);
        setTimeout(() => navigate("/admin/calendar/"), 3000);
      }
    } catch (err) {
      console.error("Error creating event:", err);
      toast.error("Failed to create event. Please try again.");
    }
  };

  return (
    <div className="drawer lg:drawer-open">
      <ToastContainer />
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

                <div className="form-control">
                  <label className="label">Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="all">All</option>
                    <option value="member">Members</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Enter event location"
                    required
                  />
                </div>

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