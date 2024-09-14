import { useEffect, useState } from "react";
import axios from 'axios';
import TitleCard from "../../components/Cards/TitleCard";
import SearchBar from "../../components/Input/SearchBar";

function Users() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        applySearch(searchText);
    }, [searchText, users]);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/api/users/apply`);
            if (response.data && Array.isArray(response.data.users)) {
                setUsers(response.data.users);
                setFilteredUsers(response.data.users);
            } else {
                console.error('Data fetched is not an array:', response.data);
                setUsers([]);
                setFilteredUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch users', error);
            setUsers([]);
            setFilteredUsers([]);
        }
    };

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = users.filter(user => 
            user.fname.toLowerCase().includes(lowercasedValue) ||
            user.lname.toLowerCase().includes(lowercasedValue)
        );
        setFilteredUsers(filtered);
    };

    const handleApplyMember = async (id, index) => {
        try {
            await axios.put(`${process.env.REACT_APP_API}/api/users/apply/${id}`, { memberId: 'newMemberId' });
            fetchUsers(); // Refresh the user list after applying
        } catch (error) {
            console.error('Failed to apply member status', error);
        }
    };

    const handleDenyApplyMember = async (id, index) => {
        try {
            await axios.put(`${process.env.REACT_APP_API}/api/users/deny-apply-member/${id}`);
            fetchUsers(); // Refresh the user list after denying
        } catch (error) {
            console.error('Failed to deny apply member status', error);
        }
    };

    return (
        <>
            <TitleCard title="All Users" topMargin="mt-2" TopSideButtons={<SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} />} >
                <div className="overflow-x-auto w-full">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Member ID</th>
                                <th>Apply Member</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user, index) => (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="avatar">
                                                <div className="mask mask-squircle w-12 h-12">
                                                    <img src={user.avatar} alt="Avatar" />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-bold">
                                                {user.fname} {user.middlei ? `${user.middlei}. ` : ''}{user.lname}
                                            </div>
                                        </td>
                                        <td>{user.role}</td>
                                        <td>{user.memberId || 'N/A'}</td>
                                        <td>{user.applyMember ? 'Yes' : 'No'}</td>
                                        <td>
                                            <button
                                                className="btn btn-success btn-sm mr-2"
                                                onClick={() => handleApplyMember(user._id, index)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDenyApplyMember(user._id, index)}
                                                style={{ backgroundColor: 'red', color: 'white' }}
                                            >
                                                Deny
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">No users found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </TitleCard>
        </>
    );
}

export default Users;
