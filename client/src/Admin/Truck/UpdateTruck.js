import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';

function UpdateTruck() {
    const { truckId } = useParams();
    const navigate = useNavigate();
    const [truckData, setTruckData] = useState({
        model: '',
        plateNo: '',
    });

    useEffect(() => {
        const fetchTruck = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API}/api/truck/${truckId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setTruckData({
                    model: response.data.truck.model || '',
                    plateNo: response.data.truck.plateNo || '',
                });
            } catch (error) {
                toast.error('Failed to load truck details.');
            }
        };
        fetchTruck();
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
            setTimeout(() => navigate('/admin/truck/list'), 2000);
        } catch (error) {
            toast.error('Failed to update truck.');
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-2 sm:p-6 bg-base-200">
                        <div className="max-w-lg w-full mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-8">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center" style={{ color: '#ed003f' }}>
                                Update Truck
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="font-semibold text-[#ed003f]">Truck Model</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={truckData.model}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#ed003f]">Plate Number</label>
                                    <input
                                        type="text"
                                        name="plateNo"
                                        value={truckData.plateNo}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div className="mt-4">
                                    <button
                                        className="btn w-full"
                                        style={{ backgroundColor: '#ed003f', color: '#fff', border: 'none' }}
                                        onClick={updateTruck}
                                    >
                                        Update Truck
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="h-16"></div>
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