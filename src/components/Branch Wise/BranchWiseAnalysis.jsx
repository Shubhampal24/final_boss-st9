import React, { useEffect, useState } from "react";
import axios from "axios";
import { Listbox } from "@headlessui/react";
import DataTable from "../DataTable";
import NavbarMain from "../NavbarMain";
import NavbarRouting from "../dashboard/NavbarRouting";
import { Toaster } from "react-hot-toast";
import { GoGraph } from "react-icons/go";
import BranchGraph from "./BranchGraph";

const BranchWiseAnalysis = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isGraphView, setIsGraphView] = useState(false);
  const [branchData, setBranchData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [topBottomFilter, setTopBottomFilter] = useState("All");

  useEffect(() => {
    const fetchBranchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const branchQuery = selectedBranch !== "All" ? `&branchId=${selectedBranch}` : "";

        const response = await axios.get(
          `${BASE_URL}/api/branches/statistics/data?date=${date}${branchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBranchData(response.data);
        setFilteredData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching branch data:", error);
        setError("Failed to load data.");
        setLoading(false);
      }
    };

    fetchBranchData();
  }, [date, selectedBranch]);

  useEffect(() => {
    if (topBottomFilter === "Top Player") {
      const topPlayers = [...branchData]
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, branchData.length);
      setFilteredData(topPlayers);
    } else if (topBottomFilter === "Bottom Player") {
      const bottomPlayers = [...branchData]
        .sort((a, b) => a.totalSales - b.totalSales)
        .slice(0, branchData.length);
      setFilteredData(bottomPlayers);
    } else {
      setFilteredData(branchData);
    }
  }, [topBottomFilter, branchData]);

  const branchOptions =
    branchData.length > 0
      ? ["All", ...new Set(branchData.map((item) => item.branchName || item.name))]
      : ["All"];

  const handleBranchChange = (selected) => {
    setSelectedBranch(selected);
    if (selected === "All") {
      setFilteredData(branchData);
    } else {
      setFilteredData(branchData.filter((item) => item.branchName === selected || item.name === selected));
    }
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleGraphView = () => {
    setIsGraphView((prevState) => !prevState);
  };

  const columns = [
    { label: "Branch ID", key: "branchId" },
    { label: "Branch Name", key: "name" },
    { label: "Short Code", key: "shortCode" },
    { label: "Total Clients", key: "totalClients" },
    { label: "Total Sales", key: "totalSales" },
  ];

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full py-5 min-h-screen h-auto bg-[#0D0D11] px-24 text-white">
      <Toaster position="top-center" reverseOrder={false} />
      <NavbarMain />
      <NavbarRouting />

      <div className="flex justify-end items-center p-4">
        <div className="w-auto">
          <div
            className="p-3 px-5 flex justify-between items-center w-42 rounded-lg bg-[#6F5FE7] cursor-pointer"
            onClick={handleGraphView}
          >
            <h3>{isGraphView ? "Table View" : "Graph View"}</h3>
            <GoGraph size={20} />
          </div>
        </div>
      </div>

      {/* Show Filters and DataTable only in Table View */}
      {!isGraphView && (
        <>
          <p className="text-2xl mt-6 font-bold mb-5 px-4 inline-block"></p>

          <div className="flex w-full justify-between items-center px-4">
            <div className="w-full flex gap-4">
              <div className="mb-4">
                <h3 className="mb-2">Select Date</h3>
                <input
                  type="date"
                  value={date}
                  onChange={handleDateChange}
                  className="py-2 px-4 bg-[#1A1A1F] border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div className="relative mb-4">
                <h3 className="mb-2">Area Filter</h3>
                <Listbox value={selectedBranch} onChange={handleBranchChange}>
                  <Listbox.Button className="py-2 px-4 min-w-52 bg-[#1A1A1F] text-left text-white border border-gray-600 rounded-lg">
                    {selectedBranch}
                  </Listbox.Button>
                  <Listbox.Options className="absolute min-w-52 bg-[#1A1A1F] mt-1 border border-gray-700 rounded-lg shadow-lg">
                    {branchOptions.map((branch, index) => (
                      <Listbox.Option
                        key={`${branch}-${index}`}
                        value={branch}
                        className={({ active }) =>
                          `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`
                        }
                      >
                        {branch}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Listbox>
              </div>

              <div className="relative mb-4">
                <h3 className="mb-2">Player Filter</h3>
                <Listbox value={topBottomFilter} onChange={setTopBottomFilter}>
                  <Listbox.Button className="py-2 px-4 min-w-52 bg-[#1A1A1F] text-left text-white border border-gray-600 rounded-lg">
                    {topBottomFilter === "All" ? "Select Filter" : topBottomFilter}
                  </Listbox.Button>
                  <Listbox.Options className="absolute min-w-52 bg-[#1A1A1F] mt-1 border border-gray-700 rounded-lg shadow-lg">
                    <Listbox.Option
                      value="All"
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`
                      }
                    >
                      All
                    </Listbox.Option>
                    <Listbox.Option
                      value="Top Player"
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`
                      }
                    >
                      Top Player
                    </Listbox.Option>
                    <Listbox.Option
                      value="Bottom Player"
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`
                      }
                    >
                      Bottom Player
                    </Listbox.Option>
                  </Listbox.Options>
                </Listbox>
              </div>
            </div>
          </div>

          <DataTable columns={columns} data={filteredData} />
        </>
      )}
      {isGraphView && <BranchGraph data={filteredData} />}
    </div>
  );
};

export default BranchWiseAnalysis;
