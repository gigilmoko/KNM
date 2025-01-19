import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from "moment";
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

function RidersList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [riders, setRiders] = useState([]);
    const [filteredRiders, setFilteredRiders] = useState([]);
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        mainContentRef.current.scroll({
            top: 0,
            behavior: "smooth"
        });
        fetchRiders();
    }, []);

    useEffect(() => {
        applySearch(searchText);
    }, [searchText, riders]);

    useEffect(() => {
        if (newNotificationMessage !== "") {
            if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
            if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
            dispatch(removeNotificationMessage());
        }
    }, [newNotificationMessage]);

    const fetchRiders = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API}/api/riders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data && Array.isArray(response.data.riders)) {
                setRiders(response.data.riders);
                setFilteredRiders(response.data.riders);
            } else {
                setRiders([]);
                setFilteredRiders([]);
            }
        } catch (error) {
            console.error('Failed to fetch riders', error);
            setRiders([]);
            setFilteredRiders([]);
        }
    };

    const deleteCurrentRider = async (id, index) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_API}/api/rider/delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRiders(riders.filter((_, i) => i !== index));
            setFilteredRiders(filteredRiders.filter((_, i) => i !== index));
            toast.success('Rider deleted successfully!');
        } catch (error) {
            console.error('Failed to delete rider', error);
            toast.error('Failed to delete rider');
        }
    };

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = riders.filter(rider => 
            rider.fname.toLowerCase().includes(lowercasedValue) ||
            rider.lname.toLowerCase().includes(lowercasedValue) ||
            rider.email.toLowerCase().includes(lowercasedValue)
        );
        setFilteredRiders(filtered);
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
                            title="All Riders"
                            topMargin="mt-2"
                            TopSideButtons={<SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} />}
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email Id</th>
                                            <th>Phone</th>
                                            <th>Password</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRiders.length > 0 ? (
                                            filteredRiders.map((rider, index) => (
                                                <tr key={rider._id}>
                                                    <td>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="avatar">
                                                                <div className="mask mask-squircle w-12 h-12">
                                                                    <img src={rider.avatar} alt="Avatar" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold">{`${rider.fname} ${rider.middlei ? `${rider.middlei}. ` : ''}${rider.lname}`}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{rider.email}</td>
                                                    <td>{rider.phone || 'N/A'}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-xs btn-primary"
                                                            onClick={() => navigate(`/admin/rider/changepassword/${rider._id}`)}
                                                        >
                                                            Change
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-xs btn-primary"
                                                            onClick={() => navigate(`/admin/rider/edit/${rider._id}`)}
                                                        >
                                                            Edit
                                                        </button>
                                                    </td>
                                                    
                                                    <td>
                                                        <button className="btn btn-square btn-ghost" onClick={() => deleteCurrentRider(rider._id, index)}>
                                                            <TrashIcon className="w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center">No riders found</td>
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

export default RidersList;
