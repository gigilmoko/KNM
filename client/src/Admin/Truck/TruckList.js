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
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import { toast, ToastContainer } from 'react-toastify';

function TruckList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [trucks, setTrucks] = useState([]);
    const [filteredTrucks, setFilteredTrucks] = useState([]);
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);

    // Modal state for delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [truckToDelete, setTruckToDelete] = useState(null);
    const [truckToDeleteIndex, setTruckToDeleteIndex] = useState(null);

    useEffect(() => {
        mainContentRef.current?.scroll({
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

            setTrucks(response.data.trucks || []);
            setFilteredTrucks(response.data.trucks || []);
        } catch (error) {
            setTrucks([]);
            setFilteredTrucks([]);
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

    const handleEdit = (truckId) => {
        navigate(`/admin/truck/edit/${truckId}`);
    };

    const confirmDeleteTruck = (id, index) => {
        setTruckToDelete(id);
        setTruckToDeleteIndex(index);
        setShowDeleteModal(true);
    };

    const deleteCurrentTruck = async () => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_API}/api/truck/delete/${truckToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTrucks(trucks.filter((_, i) => i !== truckToDeleteIndex));
            setFilteredTrucks(filteredTrucks.filter((_, i) => i !== truckToDeleteIndex));
            toast.success('Truck deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete truck');
        }
        setShowDeleteModal(false);
        setTruckToDelete(null);
        setTruckToDeleteIndex(null);
    };

    const handleCreateTruck = () => {
        navigate('/admin/truck/new');
    };

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer />
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-2 sm:px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard
                            title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>All Trucks</span>}
                            topMargin="mt-2"
                            TopSideButtons={
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                    <SearchBar
                                        searchText={searchText}
                                        styleClass="mr-0 sm:mr-4"
                                        setSearchText={setSearchText}
                                        inputProps={{
                                            style: { borderColor: '#ed003f', borderWidth: '2px' }
                                        }}
                                    />
                                    <button
                                        className="btn bg-[#ed003f] text-white font-bold border-none hover:bg-red-700 transition flex items-center gap-2"
                                        onClick={handleCreateTruck}
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        New Truck
                                    </button>
                                </div>
                            }
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full text-xs sm:text-sm">
                                    <thead>
                                        <tr>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Model</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Plate Number</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Edit</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTrucks.length > 0 ? (
                                            filteredTrucks.map((truck, index) => (
                                                <tr key={truck._id}>
                                                    <td>{truck.model}</td>
                                                    <td>{truck.plateNo}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-square btn-ghost"
                                                            onClick={() => handleEdit(truck._id)}
                                                            type="button"
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="w-5 h-5 text-[#ed003f]" />
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-square btn-ghost"
                                                            onClick={() => confirmDeleteTruck(truck._id, index)}
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="w-5 h-5 text-[#ed003f]" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center text-gray-500 py-8">
                                                    No trucks found
                                                    {searchText && (
                                                        <div className="mt-2">
                                                            <button 
                                                                className="btn btn-sm bg-[#ed003f] text-white border-none hover:bg-red-700"
                                                                onClick={() => setSearchText("")}
                                                            >
                                                                Clear Search
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-4 text-[#ed003f]">Confirm Deletion</h2>
                        <p className="mb-6">Are you sure you want to delete this truck?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="btn"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn"
                                style={{ backgroundColor: '#ed003f', color: '#fff', border: 'none' }}
                                onClick={deleteCurrentTruck}
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

export default TruckList;