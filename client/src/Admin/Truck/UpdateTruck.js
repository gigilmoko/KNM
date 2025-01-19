import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';

function UpdateTruck() {
    const navigate = useNavigate();
    const { truckId } = useParams();
    const [truckData, setTruckData] = useState({
        model: '',
        plateNo: '',
    });

    useEffect(() => {
        const fetchTruckData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API}/api/truck/${truckId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setTruckData(response.data.truck); // Update state with fetched data
                console.log('Fetched truck data:', response.data.truck);  // Verify the data
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch truck data.');
            }
        };

        fetchTruckData();
    }, [truckId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTruckData({ ...truckData, [name]: value });
    };

    const validateForm = () => {
        if (!truckData.model.trim()) {
            toast.error('Truck model is required.');
            return false;
        }
        if (!truckData.plateNo.trim()) {
            toast.error('Plate number is required.');
            return false;
        }
        return true;
    };

    const updateTruck = async () => {
        if (!validateForm()) return;

        try {
            const token = sessionStorage.getItem('token');
            await axios.put(
                `${process.env.REACT_APP_API}/api/truck/update/${truckId}`,
                truckData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            toast.success('Truck updated successfully!');
            setTimeout(() => navigate('/admin/truck/list'), 3000);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update truck.');
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6 bg-base-200">
                        <TitleCard title="Update Truck">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label>Truck Model</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={truckData.model} // Access directly
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label>Plate Number</label>
                                    <input
                                        type="text"
                                        name="plateNo"
                                        value={truckData.plateNo} // Access directly
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div className="mt-4">
                                    <button className="btn btn-primary" onClick={updateTruck}>
                                        Update Truck
                                    </button>
                                </div>
                            </div>
                        </TitleCard>
                    </main>
                </div>
                <LeftSidebar />
                <RightSidebar />
                <ModalLayout />
            </div>
        </>
    );
}

export default UpdateTruck;