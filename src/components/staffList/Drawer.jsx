import React, { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { Listbox } from "@headlessui/react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Drawer = ({ isOpen, onClose }) => {
    const [regions, setRegions] = useState([]);
    const [branches, setBranches] = useState([]);
    const [centers, setCenters] = useState([]);
    const roles = ["CM", "ARM", "Vision", "ID", "Admin", "ClubStaff", "Manager"];
    const statuses = ["Active", "Inactive"];
    const [formData, setFormData] = useState({
        name: "",
        mobileNumber: "",
        email: "",
        role: "",
        branchIds: [],
        centreIds: [],
        regionIds: [],
        status: "Active",
    });

    useEffect(() => {
        fetchRegions();
    }, []);

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

    const handleMultiSelectChange = (selected, field) => {
        setFormData((prev) => ({ ...prev, [field]: selected }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Unauthorized. Please log in.");
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/api/users/register`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            toast.success(response.data.message || "User registered successfully");
            setFormData({
                name: "",
                mobileNumber: "",
                email: "",
                role: "",
                branchIds: [],
                centreIds: [],
                regionIds: [],
                status: "Active",
            });

            onClose(); // Close drawer after submission
        } catch (error) {
            console.error("Registration Error:", error);
            toast.error(error.response?.data?.message || "Error registering user");
        }
    };
    return (
        <div className={`fixed top-0 right-0 min-h-screen overflow-y-auto h-full px-5 w-1/4 rounded-l-4xl bg-[#1F1F24] shadow-lg transform ${isOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out`}>
            <div className="p-6 text-white">
                <button onClick={onClose} className="text-white cursor-pointer text-xl absolute top-4 right-4">✖</button>
                <h2 className="text-xl font-semibold mb-4">Add New Staff</h2>
                <form className="flex flex-col gap-4">
                    <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Staff Name" className="p-4 rounded-2xl border" required />
                    <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })} placeholder="Mobile Number" className="p-4 rounded-2xl border" required />
                    <input type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email" className="p-4 rounded-2xl border" required />
                    <div className="w-full relative">
                        <Listbox value={formData.role} onChange={(value) => setFormData({ ...formData, role: value })}>
                            <Listbox.Button className="h-auto py-4 px-4 w-full text-left text-white border rounded-xl">
                                {formData.role || "Select Role"}
                            </Listbox.Button>
                            <Listbox.Options className="absolute z-10 bg-[#0D0D11] mt-1 border border-gray-700 rounded-lg shadow-lg">
                                {roles.map((role) => (
                                    <Listbox.Option key={role} value={role} className="cursor-pointer px-4 py-2 text-gray-300">
                                        {role}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Listbox>

                    </div>
                    <div className="w-full relative">
                        <Listbox value={formData.status} onChange={(value) => setFormData({ ...formData, status: value })}>
                            <Listbox.Button className="h-auto py-4 px-4 w-full text-left text-white border rounded-xl">
                                {formData.status || "Select Status"}
                            </Listbox.Button>
                            <Listbox.Options className="absolute z-10 bg-[#0D0D11] mt-1 border border-gray-700 rounded-lg shadow-lg">
                                {statuses.map((status) => (
                                    <Listbox.Option key={status} value={status} className="cursor-pointer px-4 py-2 text-gray-300">
                                        {status}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Listbox>
                    </div>
                    <div className="w-full relative">

                        <Listbox value={formData.regionIds} onChange={(value) => handleMultiSelectChange(value, "regionIds")} multiple>
                            <Listbox.Button className="h-auto py-4 px-4 w-full text-left text-white border rounded-xl">
                                {formData.regionIds.length > 0
                                    ? formData.regionIds.map(id => regions.find(region => region._id === id)?.name).join(", ")
                                    : "Select Regions"}
                            </Listbox.Button>
                            <Listbox.Options className="absolute z-10 bg-[#0D0D11] mt-1 border border-gray-700 rounded-lg shadow-lg">
                                {regions.map((region) => (
                                    <Listbox.Option key={region._id} value={region._id} className="cursor-pointer px-4 py-2 text-gray-300">
                                        {region.name}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Listbox>
                    </div>
                    <div className="w-full relative">

                        <Listbox value={formData.branchIds} onChange={(value) => handleMultiSelectChange(value, "branchIds")} multiple>
                            <Listbox.Button className="h-auto py-4 px-4 w-full text-left text-white border rounded-xl">
                                {formData.branchIds.length > 0
                                    ? formData.branchIds.map(id => branches.find(branch => branch._id === id)?.name).join(", ")
                                    : "Select Branches"}
                            </Listbox.Button>
                            <Listbox.Options className="absolute z-10 bg-[#0D0D11] mt-1 border border-gray-700 rounded-lg shadow-lg">
                                {branches.map((branch) => (
                                    <Listbox.Option key={branch._id} value={branch._id} className="cursor-pointer px-4 py-2 text-gray-300">
                                        {branch.name}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Listbox>
                    </div>
                    <div className="w-full relative">

                        <Listbox value={formData.centreIds} onChange={(value) => handleMultiSelectChange(value, "centreIds")} multiple>
                            <Listbox.Button className="h-auto py-4 px-4 w-full text-left text-white border rounded-xl">
                                {formData.centreIds.length > 0
                                    ? formData.centreIds.map(id => centers.find(center => center._id === id)?.name).join(", ")
                                    : "Select Centers"}
                            </Listbox.Button>
                            <Listbox.Options className="absolute z-10 bg-[#0D0D11] mt-1 border border-gray-700 rounded-lg shadow-lg">
                                {centers.map((center) => (
                                    <Listbox.Option key={center._id} value={center._id} className="cursor-pointer px-4 py-2 text-gray-300">
                                        {center.name}
                                    </Listbox.Option>
                                ))}
                            </Listbox.Options>
                        </Listbox>
                    </div>

                    <button onClick={handleSubmit} type="submit" className="bg-[#6F5FE7] p-2 py-4 rounded-2xl text-white font-semibold">
                        Add Staff
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Drawer;