import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CashCollectionHistory = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [regions, setRegions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [centres, setCentres] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCentre, setSelectedCentre] = useState("");
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch user data
  const fetchUserById = async (token) => {
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      const response = await axios.get(`${BASE_URL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const userData = response.data;
      setRegions(userData.regionIds || []);
      setBranches(userData.branchIds || []);
      setCentres(userData.centreIds || []);
    } catch (error) {
      console.error(
        "Error fetching user data:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchUserById(storedToken);
    }
  }, []);

  // Fetch cash collection summary
  const fetchCashSummary = async () => {
    // Only require selectedCentre and token since the API now uses centreId as URL parameter
    if (!selectedCentre || !token) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/cash-collection/cash-collection/${selectedCentre}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log("Full API Response:", response.data);
      // console.log("Data array:", response.data.data);

      // Set the data
      const dataArray = response.data.data || [];
      setSummaryData(dataArray);

      // Additional logging to debug data structure
      if (dataArray.length > 0) {
        console.log("First item structure:", dataArray[0]);
        console.log("Available keys:", Object.keys(dataArray[0]));
      }
    } catch (error) {
      console.error(
        "Error fetching cash summary:",
        error.response?.data || error.message
      );
      setSummaryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Updated useEffect - only depends on selectedCentre and token since API only needs centreId
  useEffect(() => {
    if (selectedCentre && token) {
      fetchCashSummary();
    } else {
      setSummaryData([]); // Clear data when no centre is selected
    }
  }, [selectedCentre, token]);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center p-4 px-6 border-b border-gray-800">
        <button onClick={() => navigate(-1)} className="text-white mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div className="text-lg font-medium">Cash Collection History</div>
      </div>

      <div className="w-full gap-2 px-6 h-auto grid grid-cols-3">
        <div className="py-2">
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedBranch(""); // Reset branch when region changes
              setSelectedCentre(""); // Reset center when region changes
            }}
            className="w-full p-2 text-sm rounded-lg bg-[#1E1D1D] border border-gray-600 text-white"
          >
            <option className="text-sm" value="">
              Region
            </option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
        <div className="py-2">
          <select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setSelectedCentre(""); // Reset center when branch changes
            }}
            className="w-full text-sm p-2 rounded-lg bg-[#1E1D1D] border border-gray-600 text-white"
          >
            <option value="">Branch</option>
            {branches
              .filter((branch) => branch.regionId === selectedRegion)
              .map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
          </select>
        </div>
        <div className="py-2">
          <select
            value={selectedCentre}
            onChange={(e) => setSelectedCentre(e.target.value)}
            className="w-full p-2 text-sm rounded-lg bg-[#1E1D1D] border border-gray-600 text-white"
          >
            <option className="border-b text-sm border-white" value="">
              Centre
            </option>
            {centres
              .filter((centre) => centre.branchId === selectedBranch)
              .map((centre) => (
                <option
                  className="border-b text-sm border-white"
                  key={centre.id}
                  value={centre.id}
                >
                  {centre.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-3 text-center text-xs font-medium bg-[#6F5FE7]">
          <div className="border border-white text-sm p-2 flex justify-center items-center">
            Amount
          </div>
          <div className="border border-white p-2 flex text-sm justify-center items-center">
            Receiver
          </div>
          <div className="border border-white text-sm p-2 flex justify-center items-center">
            Collection Date
          </div>
        </div>

        {/* Data */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center p-4 text-gray-400">Loading...</div>
          ) : summaryData.length > 0 ? (
            summaryData.map((item, index) => (
              <div
                key={item.id || index}
                className="grid bg-[#1E1D1D] grid-cols-3 text-center text-xs"
              >
                <div className="border p-2 flex text-xs justify-center items-center w-full border-[#6F5FE7]">
                  {item.amountReceived ||
                    item.amountReceived ||
                    item.amountReceived ||
                    "N/A"}
                </div>
                <div className="border p-2 flex text-xs justify-center items-center w-full border-[#6F5FE7]">
                  {item.postedBy ||
                    item.userId?.name ||
                    item.receivedBy ||
                    "N/A"}
                </div>
                <div className="border p-2 flex text-xs justify-center items-center w-full border-[#6F5FE7]">
                  {formatDate(
                    item.collectionDate ||
                      item.amountReceivingDate ||
                      item.createdAt
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-4 text-gray-400">
              {selectedCentre
                ? "No Data Available for this Centre"
                : "Please select a centre to view data"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashCollectionHistory;
