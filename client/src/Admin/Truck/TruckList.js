import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import { removeNotificationMessage } from "../../Layout/common/headerSlice";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from "../../Layout/Header";
import SearchBar from "../../Layout/components/Input/SearchBar";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { toast, ToastContainer } from 'react-toastify';

function TruckList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [trucks, setTrucks] = useState([]);
    const [filteredTrucks, setFilteredTrucks] = useState([]);
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);

    useEffect(() => {
        mainContentRef.current.scroll({
            top: 0,
            behavior: "smooth"
        });
        fetchTrucks();
    }, []);

    useEffect(() => {
        applySearch(searchText);
    }, [searchText, trucks]);

    useEffect(() => {
        if (newNotificationMessage !== "") {
            if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
            if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
            dispatch(removeNotificationMessage());
        }
    }, [newNotificationMessage]);

    const fetchTrucks = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API}/api/trucks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            console.log('Fetched trucks:', response.data.trucks);
    
            setTrucks(response.data.trucks || []);
        } catch (error) {
            console.error('Error fetching trucks:', error);
        }
    };

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = trucks.filter(truck => 
            truck.model.toLowerCase().includes(lowercasedValue) ||
            truck.plateNo.toLowerCase().includes(lowercasedValue)
        );
        setFilteredTrucks(filtered);
    };

    const deleteCurrentTruck = async (id, index) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_API}/api/truck/delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTrucks(trucks.filter((_, i) => i !== index));
            setFilteredTrucks(filteredTrucks.filter((_, i) => i !== index));
            toast.success('Truck deleted successfully!');
            window.location.reload(); // Reload the page to reflect the changes
        } catch (error) {
            console.error('Failed to delete truck', error);
            toast.error('Failed to delete truck');
        }
    };

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer />
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard
                            title="All Trucks"
                            topMargin="mt-2"
                            TopSideButtons={<SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} />}
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Model</th>
                                            <th>Plate Number</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTrucks.length > 0 ? (
                                            filteredTrucks.map((truck) => (
                                                <tr key={truck._id}>
                                                    <td>{truck.model}</td>
                                                    <td>{truck.plateNo}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-xs btn-primary"
                                                            onClick={() => navigate(`/admin/truck/edit/${truck._id}`)}
                                                        >
                                                            Edit
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-square btn-ghost"
                                                            onClick={() => deleteCurrentTruck(truck._id)}
                                                        >
                                                            <TrashIcon className="w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No trucks found</td>
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
            <NotificationContainer />
            <ModalLayout />
        </>
    );
}

export default TruckList;