import React, { useEffect, useState } from "react";
import DataTable from "../DataTable";
import axios from "axios";
import { Listbox } from "@headlessui/react";
import Loader from "../Loader";

const StaffAttendance = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [staffData, setStaffData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState("All");

  useEffect(() => {
    const getClubStaffUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/api/users/present/today`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        const formattedDate = `${year}-${month}-${day}`;
        const monthKey = `${year}-${month}`;

        const formattedData = response.data.presentStaff.map((item, index) => ({
          srNo: index + 1,
          centerId: item.centerId || "N/A",
          staffId: item._id,
          staffName: item.name,
          mobile: item.mobileNumber || "N/A",
        
          status: item.status || "N/A",
        }));
        

        setStaffData(formattedData);
        setFilteredData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching club staff users:", error);
        setError("Failed to load data.");
        setLoading(false);
      }
    };

    getClubStaffUsers();
  }, []);

  const centerOptions = ["All", ...new Set(staffData.map((item) => item.centerId).filter(id => id !== "N/A"))];

  const handleCenterChange = (selected) => {
    setSelectedCenter(selected);
    if (selected === "All") {
      setFilteredData(staffData);
    } else {
      setFilteredData(staffData.filter((item) => item.centerId === selected));
    }
  };

  const columns = [
    { label: "Sr No.", key: "srNo" },
    { label: "Center ID", key: "centerId" },
    { label: "Staff ID", key: "staffId" },
    { label: "Staff Name", key: "staffName" },
    { label: "Mobile", key: "mobile" },
    { label: "Status", key: "status" },
  ];

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-5 text-white min-h-screen">
      <p className="text-2xl font-bold mb-5">Staff Attendance</p>
      <p className="mb-2 text-gray-400">Date: {new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      })}</p>

      {/* iOS-style Dropdown */}
      <div className="relative mb-4">
        <h3 className="mb-2">Centre Filter</h3>
        <Listbox value={selectedCenter} onChange={handleCenterChange}>
          <Listbox.Button className="py-2 px-4 min-w-52 bg-[#0D0D11] text-left text-white border border-gray-600 rounded-lg">
            {selectedCenter}
          </Listbox.Button>
          <Listbox.Options className="absolute max-h-62 overflow-y-auto min-w-52 bg-[#0D0D11] mt-1 border border-gray-700 rounded-lg shadow-lg">
            {centerOptions.map((center) => (
              <Listbox.Option
                key={center}
                value={center}
                className={({ active }) =>
                  `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`
                }
              >
                {center}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
      </div>

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
};

export default StaffAttendance;
