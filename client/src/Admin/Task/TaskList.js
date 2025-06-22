import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import Header from "../../Layout/Header";
import SearchBar from "../../Layout/components/Input/SearchBar";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import { toast, ToastContainer } from 'react-toastify';

function TaskList() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [taskToDeleteIndex, setTaskToDeleteIndex] = useState(null);

    useEffect(() => {
        mainContentRef.current?.scroll({ top: 0, behavior: "smooth" });
        fetchTasks();
    }, []);

    useEffect(() => {
        applySearch(searchText);
    }, [searchText, tasks]);

    const fetchTasks = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API}/api/tasks`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(response.data.tasks || []);
            setFilteredTasks(response.data.tasks || []);
        } catch (error) {
            setTasks([]);
            setFilteredTasks([]);
        }
    };

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = tasks.filter(task =>
            task.name.toLowerCase().includes(lowercasedValue) ||
            (task.description && task.description.toLowerCase().includes(lowercasedValue)) ||
            (task.members && task.members.some(
                member =>
                    (member.fname && member.fname.toLowerCase().includes(lowercasedValue)) ||
                    (member.lname && member.lname.toLowerCase().includes(lowercasedValue))
            ))
        );
        setFilteredTasks(filtered);
    };

    const handleEdit = (id) => {
        navigate(`/admin/tasks/update/${id}`);
    };

    const confirmDeleteTask = (id, index) => {
        setTaskToDelete(id);
        setTaskToDeleteIndex(index);
        setShowDeleteModal(true);
    };

    const deleteCurrentTask = async () => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_API}/api/tasks/${taskToDelete}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTasks(tasks.filter((_, i) => i !== taskToDeleteIndex));
            setFilteredTasks(filteredTasks.filter((_, i) => i !== taskToDeleteIndex));
            toast.success('Task deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete task');
        }
        setShowDeleteModal(false);
        setTaskToDelete(null);
        setTaskToDeleteIndex(null);
    };

    return (
        <>
            <ToastContainer />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard
                            title={<span className="text-[#ed003f] font-bold">All Tasks</span>}
                            topMargin="mt-3"
                            TopSideButtons={
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                    <SearchBar searchText={searchText} styleClass="mr-0 sm:mr-4" setSearchText={setSearchText} />
                                    <button
                                        className="btn bg-[#ed003f] text-white font-bold border-none hover:bg-red-700 transition"
                                        onClick={() => navigate('/admin/tasks/new')}
                                    >
                                        New Task
                                    </button>
                                </div>
                            }
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full min-w-[700px]">
                                    <thead>
                                        <tr>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Name</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Description</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Persons Involved</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Deadline</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Edit</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTasks.length > 0 ? (
                                            filteredTasks.map((task, index) => (
                                                <tr key={task._id} className="hover:bg-[#fff0f4] transition">
                                                    <td>{task.name}</td>
                                                    <td>{task.description}</td>
                                                    <td>
                                                        {task.members && task.members.length > 0
                                                            ? task.members.map(m =>
                                                                <div key={m._id} style={{ border: "none", borderRadius: 0, color: "inherit", padding: 0, margin: 0 }}>
                                                                    {m.fname} {m.lname}
                                                                </div>
                                                            )
                                                            : 'None'}
                                                    </td>
                                                    <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : ''}</td>
                                                    <td>
                                                        <button className="btn btn-square btn-ghost border border-[#ed003f] hover:bg-[#fff0f4] transition" onClick={() => handleEdit(task._id)}>
                                                            <PencilIcon className="w-5" style={{ color: "#ed003f" }} />
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-square btn-ghost border border-[#ed003f] hover:bg-[#fff0f4] transition" onClick={() => confirmDeleteTask(task._id, index)}>
                                                            <TrashIcon className="w-5" style={{ color: "#ed003f" }} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center">No tasks found</td>
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-4 text-[#ed003f]">Confirm Deletion</h2>
                        <p className="mb-6">Are you sure you want to delete this task?</p>
                        <div className="flex justify-end space-x-2">
                            <button className="btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition" onClick={deleteCurrentTask}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default TaskList;