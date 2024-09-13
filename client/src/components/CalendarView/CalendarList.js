import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import TitleCard from "../../components/Cards/TitleCard";
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import EditIcon from '@heroicons/react/24/outline/PencilIcon'; // Assuming you have an edit icon
import axios from 'axios';
import SearchBar from "../../components/Input/SearchBar";

function CalendarList() {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchText, setSearchText] = useState("");
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API}/api/calendar/events`);
                if (response.data && Array.isArray(response.data.data)) {
                    setEvents(response.data.data);
                    setFilteredEvents(response.data.data);
                } else {
                    console.error('Data fetched is not an array:', response.data);
                    setEvents([]);
                    setFilteredEvents([]);
                }
            } catch (error) {
                console.error('Failed to fetch events', error);
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
        navigate(`/app/calendar/update-event/${id}`);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API}/api/calendar/event/${id}`);
            setEvents(events.filter(event => event._id !== id));
            setFilteredEvents(filteredEvents.filter(event => event._id !== id)); // Ensure filteredEvents is also updated
            console.log('Deleted event with ID:', id);
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = events.filter(event => 
            event.title.toLowerCase().includes(lowercasedValue) ||
            event.description.toLowerCase().includes(lowercasedValue)
        );
        setFilteredEvents(filtered);
    };

    // URL for the placeholder image
    const placeholderImage = "https://static.thenounproject.com/png/4334135-200.png"; // Replace with the correct URL

    return (
        <>
            <TitleCard title="Calendar Events" topMargin="mt-2" TopSideButtons={<SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} />} >
                <div className="overflow-x-auto w-full">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Edit</th>
                                <th>Delete</th>
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
                                                    e.target.onerror = null; // Prevent infinite loop if the placeholder image fails
                                                    e.target.src = placeholderImage;
                                                }}
                                            />
                                        </td>
                                        <td>{event.title}</td>
                                        <td>{event.description}</td>
                                        <td>{moment(event.startDate).format("DD MMM YY HH:mm")}</td>
                                        <td>{moment(event.endDate).format("DD MMM YY HH:mm")}</td>
                                        <td>
                                            <button className="btn btn-square btn-ghost" onClick={() => handleEdit(event._id)}>
                                                <EditIcon className="w-5" />
                                            </button>
                                        </td>
                                        <td>
                                            <button className="btn btn-square btn-ghost" onClick={() => handleDelete(event._id)}>
                                                <TrashIcon className="w-5" />
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
        </>
    );
}

export default CalendarList;
