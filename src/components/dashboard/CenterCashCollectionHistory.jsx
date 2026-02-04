import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";

const CenterCollectionHistory = ({ centreId }) => {
  const [token, setToken] = useState(null);
  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch cash collection summary using the passed centreId prop
  const fetchCashSummary = async () => {
    if (!centreId || !token) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/cash-collection/cash-collection/${centreId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const dataArray = response.data.data || [];
      setSummaryData(dataArray);

      if (dataArray.length > 0) {
        // console.log("First item structure:", dataArray[0]);
        // console.log("Available keys:", Object.keys(dataArray[0]));
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

  // Get token from localStorage once on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch cash summary when centreId or token changes
  useEffect(() => {
    if (centreId && token) {
      fetchCashSummary();
    } else {
      setSummaryData([]);
    }
  }, [centreId, token]);

  // Helper to format date strings consistently
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };
  const maxTableHeight = 300; // Set your desired max height here
  return (
    <div className="flex flex-col w-full bg-black text-white">
      {/* Table Header */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-3 text-center text-xs font-medium bg-[#6F5FE7] sticky-top">
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
        {/* Scrollable Data Container */}
        <div style={{ maxHeight: maxTableHeight, overflowY: "auto" }}>
          {loading ? (
            <div className="text-center p-4 text-gray-400">Loading...</div>
          ) : summaryData.length > 0 ? (
            summaryData.map((item, index) => (
              <div
                key={item.id || index}
                className="grid bg-[#1E1D1D] grid-cols-3 text-center text-xs"
              >
                <div className="border p-2 flex text-xs justify-center items-center w-full border-[#6F5FE7]">
                  {item.amountReceived || "N/A"}
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
              {centreId
                ? "No Data Available for this Centre"
                : "Centre ID not provided"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CenterCollectionHistory;
