import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import TitleCard from '../../Layout/components/Cards/TitleCard';

const MemberReports = () => {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMemberReports = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API}/api/reports/member-reports`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMembers(response.data.members);
      } catch (error) {
        console.error('Error fetching member reports:', error);
      }
    };

    fetchMemberReports();
  }, []);

  const generatePDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Member Reports', 14, 20);

    const tableColumn = ['Member ID', 'Name', 'Date of Birth', 'Age', 'Address'];
    const tableRows = [];

    members.forEach(member => {
      const name = `${member.fname} ${member.lname}`;
      const address = member.address.map(addr => `${addr.houseNo}, ${addr.streetName}, ${addr.barangay}, ${addr.city}`).join(', ');
      tableRows.push([member.memberId, name, member.dateOfBirth, member.age, address]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40
    });

    doc.save('Member_Reports.pdf');
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <main className="flex-1 p-6 bg-base-200">
            <TitleCard title="Member Reports" TopSideButtons={
              <button className="btn btn-primary" onClick={generatePDF}>
                Download PDF
              </button>
            }>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <table className="table w-full mt-6">
                  <thead>
                    <tr>
                      <th>Member ID</th>
                      <th>Name</th>
                      <th>Date of Birth</th>
                      <th>Age</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(member => (
                      <tr key={member._id}>
                        <td>{member.memberId}</td>
                        <td>{`${member.fname} ${member.lname}`}</td>
                        <td>{member.dateOfBirth}</td>
                        <td>{member.age}</td>
                        <td>{member.address.map(addr => `${addr.houseNo}, ${addr.streetName}, ${addr.barangay}, ${addr.city}`).join(', ')}</td>
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

export default MemberReports;