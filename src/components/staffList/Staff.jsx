import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import NavbarMain from "../NavbarMain";
import { GoPasskeyFill } from "react-icons/go";
import AccessModal from "./AccessModal";
import NavbarRouting from "../dashboard/NavbarRouting";

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  // const [selectedRole, setSelectedRole] = useState("All");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  // const roles = ["CM", "ARM", "Vision", "ID", "Admin", "ClubStaff", "Manager"];

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStaffList(response.data);
      setFilteredStaff(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAccessClick = (staff) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };
  return (
    <div className="w-full py-5 min-h-screen h-auto bg-[#0D0D11] px-24 text-white">
      <Toaster position="top-center" reverseOrder={false} />
      <NavbarMain />
      <NavbarRouting />

      <div className="overflow-x-auto mt-6">
        <table className="w-full text-left border border-gray-600">
          <thead>
            <tr className="bg-[#6F5FE7] text-center text-white">
              <th className="py-3 px-4 border">Sr no.</th>
              <th className="py-3 px-4 border">Staff ID</th>
              <th className="py-3 px-4 border">Staff Name</th>
              <th className="py-3 px-4 border">Access</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff
              .filter((staff) => staff.role === "Vision") // Filter staff by role "Vision"
              .map((staff, index) => (
                <tr
                  key={staff.id?.$oid || index}
                  className="border text-center border-gray-600"
                >
                  <td className="py-3 px-4 border">{index + 1}</td>
                  <td className="py-3 px-4 border">{staff.id || "N/A"}</td>
                  <td className="py-3 px-4 border">{staff.name || "N/A"}</td>
                  <td className="py-3  px-4 border text-center">
                    <span
                      onClick={() => handleAccessClick(staff)}
                      className="text-lg text-blue-500 text-center flex justify-center items-center cursor-pointer"
                    >
                      <GoPasskeyFill />
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <AccessModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staff={selectedStaff}
      />
    </div>
  );
};

export default Staff;
