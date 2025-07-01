import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import moment from "moment";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import SearchBar from "../../Layout/components/Input/SearchBar";
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import EditIcon from '@heroicons/react/24/outline/PencilIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import CalendarIcon from '@heroicons/react/24/outline/CalendarIcon';
import ClockIcon from '@heroicons/react/24/outline/ClockIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import Header from "../../Layout/Header";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import { toast, ToastContainer } from 'react-toastify';

function CalendarList() {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const navigate = useNavigate();
    const [sortOrder, setSortOrder] = useState("desc");
    const [showDeletePrompt, setShowDeletePrompt] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API}/api/calendar/events`);
                if (response.data && Array.isArray(response.data.data)) {
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

    const handleView = (id) => {
        navigate(`/admin/calendar/info/${id}`);
    };

    const handleEdit = (id, isCompleted) => {
        if (isCompleted) {
            toast.error('Cannot edit completed events');
            return;
        }
        navigate(`/admin/calendar/update/${id}`);
    };

    const handleDeleteClick = (id, isCompleted) => {
        if (isCompleted) {
            toast.error('Cannot delete completed events');
            return;
        }
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

    const placeholderImage = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center";

    const getEventStatus = (startDate, endDate) => {
        const now = moment();
        const start = moment(startDate);
        const end = moment(endDate);

        if (now.isBefore(start)) {
            return { status: 'upcoming', color: 'bg-blue-100 text-blue-800', text: 'Upcoming', isCompleted: false };
        } else if (now.isBetween(start, end)) {
            return { status: 'ongoing', color: 'bg-green-100 text-green-800', text: 'Ongoing', isCompleted: false };
        } else {
            return { status: 'completed', color: 'bg-gray-100 text-gray-800', text: 'Completed', isCompleted: true };
        }
    };

    const EventCard = ({ event }) => {
        const eventStatus = getEventStatus(event.startDate, event.endDate);
        
        return (
            <div className="bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group">
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={event.image || placeholderImage}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = placeholderImage;
                        }}
                    />
                    <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${eventStatus.color}`}>
                            {eventStatus.text}
                        </span>
                    </div>
                    {eventStatus.isCompleted && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">Event Completed</span>
                        </div>
                    )}
                </div>

                {/* Event Content */}
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {event.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-gray-500">
                            <CalendarIcon className="w-4 h-4 mr-2 text-[#ed003f]" />
                            <span>{moment(event.startDate).format("MMM DD, YYYY")}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon className="w-4 h-4 mr-2 text-[#ed003f]" />
                            <span>
                                {moment(event.startDate).format("HH:mm")} - {moment(event.endDate).format("HH:mm")}
                            </span>
                        </div>
                        {event.location && (
                            <div className="flex items-center text-sm text-gray-500">
                                <MapPinIcon className="w-4 h-4 mr-2 text-[#ed003f]" />
                                <span className="truncate">{event.location}</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <button
                            onClick={() => handleView(event._id)}
                            className="flex items-center space-x-2 px-4 py-2 bg-[#ed003f] text-white rounded-md hover:bg-[#d1002f] transition-colors duration-200"
                        >
                            <EyeIcon className="w-4 h-4" />
                            <span>View</span>
                        </button>
                        
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleEdit(event._id, eventStatus.isCompleted)}
                                disabled={eventStatus.isCompleted}
                                className={`p-2 rounded-md transition-colors duration-200 ${
                                    eventStatus.isCompleted
                                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                        : 'text-gray-600 hover:text-[#ed003f] hover:bg-gray-100'
                                }`}
                                title={eventStatus.isCompleted ? 'Cannot edit completed events' : 'Edit event'}
                            >
                                <EditIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleDeleteClick(event._id, eventStatus.isCompleted)}
                                disabled={eventStatus.isCompleted}
                                className={`p-2 rounded-md transition-colors duration-200 ${
                                    eventStatus.isCompleted
                                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                        : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                                }`}
                                title={eventStatus.isCompleted ? 'Cannot delete completed events' : 'Delete event'}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const EventRow = ({ event }) => {
        const eventStatus = getEventStatus(event.startDate, event.endDate);
        
        return (
            <div className={`bg-white rounded-md shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 p-6 mb-4 ${
                eventStatus.isCompleted ? 'opacity-75' : ''
            }`}>
                <div className="flex items-center space-x-6">
                    {/* Event Image */}
                    <div className="flex-shrink-0 relative">
                        <img
                            src={event.image || placeholderImage}
                            alt={event.title}
                            className="w-20 h-20 object-cover rounded-md"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = placeholderImage;
                            }}
                        />
                        {eventStatus.isCompleted && (
                            <div className="absolute inset-0 bg-black bg-opacity-30 rounded-md flex items-center justify-center">
                                <span className="text-white font-semibold text-xs">Done</span>
                            </div>
                        )}
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                        {event.title}
                                    </h3>
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${eventStatus.color}`}>
                                        {eventStatus.text}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                    {event.description}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <CalendarIcon className="w-4 h-4 mr-1 text-[#ed003f]" />
                                        {moment(event.startDate).format("MMM DD, YYYY")}
                                    </div>
                                    <div className="flex items-center">
                                        <ClockIcon className="w-4 h-4 mr-1 text-[#ed003f]" />
                                        {moment(event.startDate).format("HH:mm")} - {moment(event.endDate).format("HH:mm")}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-2 ml-6">
                                <button
                                    onClick={() => handleView(event._id)}
                                    className="px-4 py-2 bg-[#ed003f] text-white rounded-md hover:bg-[#d1002f] transition-colors duration-200 text-sm"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => handleEdit(event._id, eventStatus.isCompleted)}
                                    disabled={eventStatus.isCompleted}
                                    className={`p-2 rounded-md transition-colors duration-200 ${
                                        eventStatus.isCompleted
                                            ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                            : 'text-gray-600 hover:text-[#ed003f] hover:bg-gray-100'
                                    }`}
                                    title={eventStatus.isCompleted ? 'Cannot edit completed events' : 'Edit event'}
                                >
                                    <EditIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(event._id, eventStatus.isCompleted)}
                                    disabled={eventStatus.isCompleted}
                                    className={`p-2 rounded-md transition-colors duration-200 ${
                                        eventStatus.isCompleted
                                            ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                                            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                                    }`}
                                    title={eventStatus.isCompleted ? 'Cannot delete completed events' : 'Delete event'}
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer />
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-gray-50">
                        <div className="max-w-7xl mx-auto">
                            {/* Header Section */}
                            <div className="mb-8">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar Events</h1>
                                        <p className="text-gray-600">Manage your events and activities</p>
                                    </div>
                                    
                                    {/* Controls */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                        <SearchBar 
                                            searchText={searchText} 
                                            styleClass="w-full sm:w-auto" 
                                            setSearchText={setSearchText}
                                            placeholder="Search events..."
                                        />
                                        
                                        <div className="flex items-center gap-2">
                                            {/* View Toggle */}
                                            <div className="bg-white rounded-md p-1 border border-gray-200">
                                                <button
                                                    onClick={() => setViewMode("grid")}
                                                    className={`p-2 rounded-md transition-colors ${
                                                        viewMode === "grid" 
                                                            ? "bg-[#ed003f] text-white" 
                                                            : "text-gray-600 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zm-6 8a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zm6 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setViewMode("list")}
                                                    className={`p-2 rounded-md transition-colors ${
                                                        viewMode === "list" 
                                                            ? "bg-[#ed003f] text-white" 
                                                            : "text-gray-600 hover:bg-gray-100"
                                                    }`}
                                                >
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                            
                                            {/* Sort Button */}
                                            <button
                                                onClick={toggleSortOrder}
                                                className="px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                                            >
                                                {sortOrder === "asc" ? "↑ Oldest First" : "↓ Newest First"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Events Display */}
                            {filteredEvents.length > 0 ? (
                                <div className={
                                    viewMode === "grid" 
                                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                                        : "space-y-4"
                                }>
                                    {filteredEvents.map((event) => (
                                        viewMode === "grid" 
                                            ? <EventCard key={event._id} event={event} />
                                            : <EventRow key={event._id} event={event} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                                    <p className="text-gray-600 mb-6">
                                        {searchText ? 
                                            "Try adjusting your search terms" : 
                                            "Get started by creating your first event"
                                        }
                                    </p>
                                    <button
                                        onClick={() => navigate('/admin/calendar/new')}
                                        className="px-6 py-3 bg-[#ed003f] text-white rounded-md hover:bg-[#d1002f] transition-colors duration-200 font-medium"
                                    >
                                        Create Event
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="h-16"></div>
                    </main>
                </div>
                <LeftSidebar />
            </div>
            <RightSidebar />
            <ModalLayout />

            {/* Modern Delete Confirmation Modal */}
            {showDeletePrompt && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <div className="bg-white rounded-md shadow-2xl max-w-md w-full overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                                <TrashIcon className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Event</h3>
                            <p className="text-gray-600 text-center mb-6">
                                Are you sure you want to delete this event? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={cancelDelete}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors duration-200 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default CalendarList;