import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import TitleCard from '../../Layout/components/Cards/TitleCard';

const UserReports = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API}/api/reports/user-reports`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching user reports:', error);
      }
    };

    fetchUserReports();
  }, []);

  const generatePDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('User Reports', 14, 20);

    const tableColumn = ['User ID', 'Name', 'Email', 'Phone', 'Address'];
    const tableRows = [];

    users.forEach(user => {
      const name = `${user.fname} ${user.lname}`;
      const address = user.address.map(addr => `${addr.houseNo}, ${addr.streetName}, ${addr.barangay}, ${addr.city}`).join(', ');
      tableRows.push([user._id, name, user.email, user.phone, address]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40
    });

    doc.save('User_Reports.pdf');
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <main className="flex-1 p-6 bg-base-200">
            <TitleCard title="User Reports" TopSideButtons={
              <button className="btn btn-primary" onClick={generatePDF}>
                Download PDF
              </button>
            }>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <table className="table w-full mt-6">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user._id}</td>
                        <td>{`${user.fname} ${user.lname}`}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.address.map(addr => `${addr.houseNo}, ${addr.streetName}, ${addr.barangay}, ${addr.city}`).join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TitleCard>
          </main>
        </div>
        <LeftSidebar />
      </div>
      <RightSidebar />
      <ModalLayout />
    </>
  );
};

export default UserReports;