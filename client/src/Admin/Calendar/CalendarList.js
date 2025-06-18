import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import moment from "moment";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import SearchBar from "../../Layout/components/Input/SearchBar";
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import EditIcon from '@heroicons/react/24/outline/PencilIcon';
import Header from "../../Layout/Header";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import { toast, ToastContainer } from 'react-toastify';

function CalendarList() {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate();
    const [sortOrder, setSortOrder] = useState("desc"); // Default to latest to oldest
    const [showDeletePrompt, setShowDeletePrompt] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API}/api/calendar/events`);
                if (response.data && Array.isArray(response.data.data)) {
                    // Sort events from latest to oldest by default
                    const sorted = [...response.data.data].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
                    setEvents(sorted);
                    setFilteredEvents(sorted);
                } else {
                    setEvents([]);
                    setFilteredEvents([]);
                }
            } catch (error) {
                setEvents([]);
                setFilteredEvents([]);
            }
        };
        fetchEvents();
    }, []);

    useEffect(() => {
        applySearch(searchText);
    }, [searchText, events]);

    const handleEdit = (id) => {
        navigate(`/admin/calendar/update/${id}`);
    };

    const handleDeleteClick = (id) => {
        setEventToDelete(id);
        setShowDeletePrompt(true);
    };

    const confirmDelete = async () => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_API}/api/calendar/event/${eventToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEvents(events.filter(event => event._id !== eventToDelete));
            setFilteredEvents(filteredEvents.filter(event => event._id !== eventToDelete));
            toast.success('Event deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete event');
        }
        setShowDeletePrompt(false);
        setEventToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeletePrompt(false);
        setEventToDelete(null);
    };

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = events.filter(event =>
            event.title.toLowerCase().includes(lowercasedValue) ||
            event.description.toLowerCase().includes(lowercasedValue)
        );
        setFilteredEvents(filtered);
    };

    const toggleSortOrder = () => {
        const sortedEvents = [...filteredEvents].sort((a, b) => {
            return sortOrder === "asc"
                ? new Date(a.startDate) - new Date(b.startDate)
                : new Date(b.startDate) - new Date(a.startDate);
        });
        setFilteredEvents(sortedEvents);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    const placeholderImage = "https://static.thenounproject.com/png/4334135-200.png";

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer />
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200">
                        <TitleCard
                            title={<span style={{ color: "#ed003f", fontWeight: "bold" }}>Calendar Events</span>}
                            topMargin="mt-2"
                            TopSideButtons={
                                <div className="flex items-center space-x-2">
                                    <SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} />
                                    <button
                                        className="btn"
                                        style={{ color: "#ed003f", border: "2px solid #ed003f", background: "transparent", fontWeight: "bold" }}
                                        onClick={toggleSortOrder}
                                    >
                                        {sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
                                    </button>
                                </div>
                            }
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Image</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Title</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Description</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Start Date</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>End Date</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Edit</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredEvents.length > 0 ? (
                                            filteredEvents.map((event) => (
                                                <tr key={event._id}>
                                                    <td>
                                                        <img
                                                            src={event.image || placeholderImage}
                                                            alt={event.title || "Event Image"}
                                                            className="w-12 h-12 object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = placeholderImage;
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="text-blue-500 hover:underline"
                                                            onClick={() => navigate(`/admin/calendar/info/${event._id}`)}
                                                        >
                                                            {event.title}
                                                        </button>
                                                    </td>
                                                    <td>{event.description}</td>
                                                    <td>{moment(event.startDate).format("DD MMM YY HH:mm")}</td>
                                                    <td>{moment(event.endDate).format("DD MMM YY HH:mm")}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-square btn-ghost"
                                                            onClick={() => handleEdit(event._id)}
                                                            style={{ border: "2px solid #ed003f", color: "#ed003f" }}
                                                        >
                                                            <EditIcon className="w-5" style={{ color: "#ed003f" }} />
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-square btn-ghost"
                                                            onClick={() => handleDeleteClick(event._id)}
                                                            style={{ border: "2px solid #ed003f", color: "#ed003f" }}
                                                        >
                                                            <TrashIcon className="w-5" style={{ color: "#ed003f" }} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="text-center">No events found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </TitleCard>
                        <div className="h-16"></div>
                    </main>
                </div>
                <LeftSidebar />
            </div>
            <RightSidebar />
            <ModalLayout />

            {/* Delete Prompt Modal */}
            {showDeletePrompt && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-4 text-[#ed003f]">Delete Event</h2>
                        <p className="mb-6">Are you sure you want to delete this event?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="btn"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn"
                                style={{ backgroundColor: '#ed003f', color: '#fff', border: 'none' }}
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default CalendarList;