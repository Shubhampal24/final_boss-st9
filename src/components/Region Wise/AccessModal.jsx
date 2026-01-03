import React, { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import axios from "axios";
import { RxCross2 } from "react-icons/rx";

import toast from "react-hot-toast";  // Import toast
const AccessModal = ({ isOpen, onClose, staff }) => {
  const [regions, setRegions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [centers, setCenters] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedCenters, setSelectedCenters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (isOpen) {
      fetchRegions();
      if (staff?._id) {
        fetchUserAccess(staff._id);
      }
    }
  }, [isOpen, staff]);

  const fetchRegions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${BASE_URL}/api/regions-branches-centres/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegions(response.data.regions || []);
      setBranches(response.data.branches || []);
      setCenters(response.data.centres || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch regions, branches, and centers.");
    }
  };

  const fetchUserAccess = async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/users/${userId}`);
      const { regionIds = [], branchIds = [], centreIds = [] } = response.data;
      setSelectedRegions(regionIds);
      setSelectedBranches(branchIds);
      setSelectedCenters(centreIds);
    } catch (error) {
      console.error("Error fetching user access:", error);
      toast.error("Failed to fetch user access data.");
    }
  };

  const handleUpdateAccess = async () => {
    try {
      await axios.put(`${BASE_URL}/api/users/${staff._id}`, {
        regionIds: selectedRegions,
        branchIds: selectedBranches,
        centreIds: selectedCenters,
      });
      toast.success("User access updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating user access:", error);
      toast.error("Failed to update user access.");
    }
  };


  const handleDelete = async (id, type) => {

    if (type === "region") {
      setSelectedRegions(prevRegions => {
        const updatedRegions = prevRegions.filter(regionId => String(regionId) !== String(id));
        updateUserData(updatedRegions, selectedBranches, selectedCenters);
        return updatedRegions;
      });
    } else if (type === "branch") {
      setSelectedBranches(prevBranches => {
        const updatedBranches = prevBranches.filter(branchId => String(branchId) !== String(id));
        updateUserData(selectedRegions, updatedBranches, selectedCenters);
        return updatedBranches;
      });
    } else if (type === "center") {
      setSelectedCenters(prevCenters => {
        const updatedCenters = prevCenters.filter(centerId => String(centerId) !== String(id));
        updateUserData(selectedRegions, selectedBranches, updatedCenters);
        return updatedCenters;
      });
    }
  };


  // Separate function to update user data
  const updateUserData = async (regions, branches, centers) => {
    try {
      await axios.put(`${BASE_URL}/api/users/${staff._id}`, {
        regionIds: regions,
        branchIds: branches,
        centreIds: centers,
      });

      toast.success("Item removed successfully!");
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to remove item.");
    }
  };


  const staffDetails = {
    Name: staff?.name,
    Role: staff?.role,
    Mobile: staff?.mobileNumber,
    Email: staff?.email,
    Status: staff?.status,
  };

  const renderMultiSelect = (label, value, setValue, options) => {
    return (
      <div className="mb-4">
        <label className="block text-white font-semibold">{label}</label>
  
        {/* Display Selected Items Outside Listbox.Button */}
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((item, index) => {
            const id = typeof item === "object" ? item._id : item;
            const found = options.find((o) => String(o._id) === String(id));
  
            return found ? (
              <span
                key={`${id}-${index}`}
                className="bg-blue-900 mb-2 text-white px-2 py-1 rounded-md flex items-center gap-2"
              >
                {found.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event from affecting Listbox
                    setValue((prev) =>
                      prev.filter((v) => String(v._id || v) !== String(id))
                    );
                  }}
                  className="text-red-500 cursor-pointer hover:text-red-700 ml-2"
                > 
                  <RxCross2 size={24}/>
                </button>
              </span>
            ) : null;
          })}
        </div>
  
        {/* Listbox for Selection */}
        <Listbox value={value} onChange={setValue} multiple>
          <Listbox.Button className="py-2 min-w-52 px-4 bg-[#0D0D11] text-left text-white border border-gray-600 rounded-lg">
            Select {label}
          </Listbox.Button>
  
          <Listbox.Options className="absolute cursor-pointer min-w-80 z-10 bg-[#0D0D11] mt-1 border border-gray-700 rounded-lg shadow-lg">
            {options.map((option) => (
              <Listbox.Option
                key={option._id}
                value={option._id}
                className="cursor-pointer px-4 py-2 text-gray-300 hover:bg-gray-700"
              >
                {option.name}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
      </div>
    );
  };
  


  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="bg-[#1F1F24] text-white p-6 flex gap-6 rounded-lg shadow-lg w-auto max-w-[90vw] min-w-[60vw]">
          <div className="w-1/2 p-4 rounded-lg h-auto">
            <h3 className="py-2 text-lg font-bold">Staff Details</h3>
            {staff ? (
              <div className="overflow-x-auto mt-4">
                <table className="w-full border-collapse border text-white">
                  <tbody>
                    {Object.entries(staffDetails).map(([label, value]) => (
                      <tr key={label} className="border">
                        <td className="px-4 py-2 font-semibold border bg-[#6F5FE7]">{label}</td>
                        <td className="px-4 py-2">{value || "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-white mt-4">No staff selected.</p>
            )}
          </div>

          <div className="w-1/2 h-full p-4">
            <h3 className="py-2 text-lg font-bold">Select Access</h3>
            {renderMultiSelect("Regions", selectedRegions, setSelectedRegions, regions)}
            {renderMultiSelect("Branches", selectedBranches, setSelectedBranches, branches)}
            {renderMultiSelect("Centers", selectedCenters, setSelectedCenters, centers)}
            <div className="flex justify-end gap-4">
              <button className="bg-zinc-700 cursor-pointer text-white px-4 py-2 rounded" onClick={onClose}>Cancel</button>
              <button className="bg-[#6F5FE7] cursor-pointer text-white px-4 py-2 rounded" onClick={handleUpdateAccess}>Save Changes</button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default AccessModal;