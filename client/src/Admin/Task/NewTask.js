import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import { toast, ToastContainer } from 'react-toastify';

function NewTask() {
    const navigate = useNavigate();
    const mainContentRef = useRef(null);
    const [taskData, setTaskData] = useState({
        name: "",
        description: "",
        members: [],
        deadline: "",
    });
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState("");
    const [memberError, setMemberError] = useState("");

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API}/api/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMembers(response.data.data || []);
        } catch (error) {
            setMembers([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddMember = () => {
        if (!selectedMember) return;
        if (taskData.members.includes(selectedMember)) {
            setMemberError("Member already added.");
            return;
        }
        setTaskData(prev => ({
            ...prev,
            members: [...prev.members, selectedMember],
        }));
        setSelectedMember("");
        setMemberError("");
    };

    const handleRemoveMember = (id) => {
        setTaskData(prev => ({
            ...prev,
            members: prev.members.filter(memberId => memberId !== id),
        }));
        setMemberError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!taskData.name.trim()) return toast.error('Task name is required!');
        if (!taskData.members.length) return toast.error('At least one person involved is required!');
        if (!taskData.deadline) return toast.error('Deadline is required!');
        try {
            const token = sessionStorage.getItem("token");
            await axios.post(`${process.env.REACT_APP_API}/api/tasks`, taskData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success('Task created successfully!');
            setTimeout(() => navigate('/admin/tasks'), 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred while creating task.');
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-base-200" ref={mainContentRef}>
                        <div className="max-w-2xl w-full mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-8 mt-4">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-[#ed003f]">
                                Create New Task
                            </h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:gap-6" autoComplete="off">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Task Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={taskData.name}
                                        onChange={handleChange}
                                        className="input input-bordered w-full text-sm"
                                        placeholder="Enter task name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={taskData.description}
                                        onChange={handleChange}
                                        className="textarea textarea-bordered w-full text-sm"
                                        placeholder="Enter task description"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Add Person Involved</label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <select
                                            value={selectedMember}
                                            onChange={e => {
                                                setSelectedMember(e.target.value);
                                                setMemberError("");
                                            }}
                                            className="select select-bordered w-full text-sm"
                                            aria-label="Select member to add"
                                        >
                                            <option value="">Select a member</option>
                                            {members
                                                .filter(m => !taskData.members.includes(m._id))
                                                .map(member => (
                                                    <option key={member._id} value={member._id}>
                                                        {member.fname} {member.lname}
                                                    </option>
                                                ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition"
                                            onClick={handleAddMember}
                                            disabled={!selectedMember}
                                            aria-disabled={!selectedMember}
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {memberError && <div className="text-red-500 text-xs mt-1">{memberError}</div>}
                                    {/* Show selected members */}
                                    <div className="mt-2 flex flex-col sm:flex-row flex-wrap gap-2">
                                        {taskData.members.map(id => {
                                            const member = members.find(m => m._id === id);
                                            return member ? (
                                                <span key={id} className="flex items-center gap-1 text-sm">
                                                    {member.fname} {member.lname}
                                                    <button
                                                        type="button"
                                                        className="ml-1 text-red-500"
                                                        onClick={() => handleRemoveMember(id)}
                                                        title="Remove"
                                                        aria-label={`Remove ${member.fname} ${member.lname}`}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                    <input
                                        type="date"
                                        name="deadline"
                                        value={taskData.deadline}
                                        onChange={handleChange}
                                        required
                                        className="input input-bordered w-full text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="btn w-full text-base font-semibold bg-[#ed003f] text-white border-none hover:bg-red-700 transition"
                                >
                                    Create Task
                                </button>
                            </form>
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

export default NewTask;