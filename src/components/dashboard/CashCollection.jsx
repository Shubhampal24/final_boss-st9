import React, { useEffect, useState } from "react";
import DataTable from "../DataTable";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Loader from "../Loader";
import righttick from "../../assets/Images/tick.png";
import wrong_tick from "../../assets/Images/wrong_tick.png";

// Add custom CSS for date picker and dropdown
const customStyles = `
  .react-datepicker-wrapper {
    display: block;
    width: 100%;
  }
  
  .react-datepicker-popper {
    z-index: 9999 !important;
  }
  
  .react-datepicker {
    font-family: inherit;
    background-color: #1f2937;
    color: white;
    border: 1px solid #4b5563;
    border-radius: 0.5rem;
  }
  
  .react-datepicker__header {
    background-color: #111827;
    border-bottom: 1px solid #4b5563;
  }
  
  .react-datepicker__current-month,
  .react-datepicker__day-name,
  .react-datepicker__day {
    color: white;
  }
  
  .react-datepicker__day:hover {
    background-color: #4b5563;
  }
  
  .react-datepicker__day--selected {
    background-color: #6366f1;
  }

  .custom-dropdown {
    position: relative;
    width: 100%;
  }
  
  .custom-dropdown-button {
    width: 100%;
    min-width: 200px;
    padding: 0.5rem 1rem;
    background-color: #0D0D11;
    color: white;
    border: 1px solid #4b5563;
    border-radius: 0.5rem;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .custom-dropdown-options {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    min-width: 240px;
    max-height: 15rem;
    overflow-y: auto;
    background-color: #1f2937;
    border: 1px solid #4b5563;
    border-radius: 0.5rem;
    z-index: 50;
    margin-top: 0.25rem;
  }
  
  .custom-dropdown-option {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  
  .custom-dropdown-option:hover {
    background-color: #374151;
  }
`;

const CashCollection = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [centers, setCenters] = useState([]);
  const [collections, setCollections] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState("All");
  const [selectedDate, setSelectedDate] = useState(null);
  const [centerDropdownOpen, setCenterDropdownOpen] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState("All");
  const [collectorDropdownOpen, setCollectorDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        collectorDropdownOpen &&
        !event.target.closest(".collector-dropdown")
      ) {
        setCollectorDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [collectorDropdownOpen]);

  // Insert stylesheet for datepicker and custom dropdown once on mount
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (centerDropdownOpen && !event.target.closest(".center-dropdown")) {
        setCenterDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [centerDropdownOpen]);

  useEffect(() => {
    const fetchCenters = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${BASE_URL}/api/centres/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCenters(response.data);
      } catch (error) {
        console.error("Error fetching centers:", error);
        setError(
          `Failed to load centers: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    };

    fetchCenters();
  }, [BASE_URL]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token is missing.");
      setLoading(false);
      return;
    }

    const fetchCollections = async () => {
      setLoading(true);
      setError(null);
      try {
        const endpoint =
          selectedCenter === "All"
            ? `${BASE_URL}/api/cash-collection/cash-collection`
            : `${BASE_URL}/api/cash-collection/cash-collection/${selectedCenter}`;

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Handle different response structures and empty data
        let collectionsData = [];

        if (response.data.data) {
          collectionsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          collectionsData = response.data;
        } else if (response.data.collections) {
          collectionsData = response.data.collections;
        }

        setCollections(collectionsData);
        setFilteredData(collectionsData);

        // If the API responds with success but no data, we'll handle it differently
        if (collectionsData.length === 0) {
          setError(null); // This is not an error, just no data
        }
      } catch (error) {
        console.error("Error fetching collections:", error);

        if (
          error.response?.data?.message === "No cash collection records found."
        ) {
          // This is not an error, just no data available
          setCollections([]);
          setFilteredData([]);
          setError(null);
        } else {
          // This is an actual error
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.response?.statusText ||
            error.message ||
            "Failed to load collections.";

          setError(errorMessage);
          setCollections([]);
          setFilteredData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [selectedCenter, BASE_URL]);

  useEffect(() => {
    let filtered = collections;

    // Date filter
    if (selectedDate) {
      const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");
      filtered = filtered.filter((item) => {
        if (!item.amountReceivingDate) return false;
        const itemDate = format(
          new Date(item.amountReceivingDate),
          "yyyy-MM-dd"
        );
        return itemDate === formattedSelectedDate;
      });
    }

    // Collector filter
    if (selectedCollector !== "All") {
      filtered = filtered.filter(
        (item) => item.userId?.id === selectedCollector
      );
    }

    setFilteredData(filtered);
  }, [selectedDate, collections, selectedCollector]);

  const centerOptions = [
    { label: "All", value: "All" },
    ...centers.map((center) => ({ label: center.centreId, value: center.id })),
  ];
  const selectedCenterObj =
    centerOptions.find((center) => center.value === selectedCenter) ||
    centerOptions[0];

  const handleCenterChange = (selected) => {
    if (selected === "All" || selected.value === "All") {
      setSelectedCenter("All");
    } else {
      setSelectedCenter(selected.value);
    }
    setCenterDropdownOpen(false);
  };

  // Add collector options
  const getUniqueCollectors = () => {
    const uniqueCollectors = new Map();
    collections.forEach((item) => {
      if (item.userId?.id && item.userId?.name) {
        uniqueCollectors.set(item.userId.id, item.userId.name);
      }
    });
    return [
      { value: "All", label: "All" },
      ...Array.from(uniqueCollectors).map(([id, name]) => ({
        value: id,
        label: name,
      })),
    ];
  };

  const collectorOptions = getUniqueCollectors();
  const selectedCollectorObj =
    collectorOptions.find(
      (collector) => collector.value === selectedCollector
    ) || collectorOptions[0];

  // Add handler for collector change
  const handleCollectorChange = (selected) => {
    setSelectedCollector(selected.value);
    setCollectorDropdownOpen(false);
  };

  const roleToFieldMap = {
    bmVerify: "OT",
    amVerify: "RM",
  };

  const handleToggleVerification = async (id, role) => {
    const token = localStorage.getItem("token");
    const field = roleToFieldMap[role];

    try {
      const res = await axios.put(
        `${BASE_URL}/api/cash-collection/${id}/toggle-verification`,
        { field },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedData = filteredData.map((item) => {
        if (item.id === id) {
          const newValue =
            item[field] === "Verified" ? "Unverified" : "Verified";
          return { ...item, [field]: newValue };
        }
        return item;
      });

      setFilteredData(updatedData);

      const updatedCollections = collections.map((item) => {
        if (item.id === id) {
          const newValue =
            item[field] === "Verified" ? "Unverified" : "Verified";
          return { ...item, [field]: newValue };
        }
        return item;
      });
      setCollections(updatedCollections);
    } catch (err) {
      console.error(
        "Error toggling verification:",
        err.response?.data || err.message
      );
      setError("Failed to update verification status.");
    }
  };

  const columns = [
    {
      label: "Sr No.",
      key: "srNo",
      render: (_, index) => index + 1,
    },
    {
      label: "Center Name",
      key: "centreId",
      render: (row) => row.centreId?.centreId || "N/A",
    },
    { label: "Amount", key: "amountReceived" },
    {
      label: "Collected By",
      key: "collectedBy",
      render: (row) => row.userId?.name || "N/A",
    },
    {
      label: "Remarks",
      key: "remark",
      render: (row) => row.remark || "N/A",
    },
    {
      label: "Receiving Date",
      key: "amountReceivingDate",
      render: (row) =>
        row.amountReceivingDate
          ? new Date(row.amountReceivingDate).toLocaleString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            })
          : "N/A",
    },
    {
      label: "BM Verify",
      key: "bmVerify",
      render: (row) => (
        <button onClick={() => handleToggleVerification(row.id, "bmVerify")}>
          <img
            src={row.OT === "Verified" ? righttick : wrong_tick}
            alt={row.OT === "Verified" ? "Verified" : "Unverified"}
            className="w-5 h-5 mx-auto cursor-pointer"
          />
        </button>
      ),
    },
    {
      label: "AM Verify",
      key: "amVerify",
      render: (row) => (
        <button onClick={() => handleToggleVerification(row.id, "amVerify")}>
          <img
            src={row.RM === "Verified" ? righttick : wrong_tick}
            alt={row.RM === "Verified" ? "Verified" : "Unverified"}
            className="w-5 h-5 mx-auto cursor-pointer"
          />
        </button>
      ),
    },
  ];

  if (loading) return <Loader />;

  // Actual error display
  if (error)
    return (
      <div className="p-5 text-white min-h-screen">
        <p className="text-2xl font-bold mb-5">Cash Collection</p>
        <div className="bg-red-900/50 p-4 rounded-lg">
          <p className="text-red-200">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );

  // No data display
  if (!loading && filteredData.length === 0) {
    return (
      <div className="p-5 text-white min-h-screen">
        <p className="text-2xl font-bold mb-5">Cash Collection</p>

        <div className="flex flex-col md:flex-row md:gap-4 mb-4">
          <div className="relative mb-4 md:mb-0 w-full md:w-auto">
            <h3 className="mb-2">Centre Filter</h3>
            <div
              className="custom-dropdown center-dropdown"
              style={{ minWidth: "240px" }}
            >
              <button
                className="custom-dropdown-button"
                onClick={() => setCenterDropdownOpen(!centerDropdownOpen)}
              >
                <span>{selectedCenterObj.label}</span>
                <span className="ml-2">▼</span>
              </button>
              {centerDropdownOpen && (
                <div className="custom-dropdown-options">
                  {centerOptions.map((center) => (
                    <div
                      key={center.value}
                      className="custom-dropdown-option"
                      onClick={() => handleCenterChange(center)}
                    >
                      {center.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="relative mb-4 md:mb-0 w-full md:w-auto">
            <h3 className="mb-2">Collected By</h3>
            <div
              className="custom-dropdown collector-dropdown"
              style={{ minWidth: "240px" }}
            >
              <button
                className="custom-dropdown-button"
                onClick={() => setCollectorDropdownOpen(!collectorDropdownOpen)}
              >
                <span>{selectedCollectorObj.label}</span>
                <span className="ml-2">▼</span>
              </button>
              {collectorDropdownOpen && (
                <div className="custom-dropdown-options">
                  {collectorOptions.map((collector) => (
                    <div
                      key={collector.value}
                      className="custom-dropdown-option"
                      onClick={() => handleCollectorChange(collector)}
                    >
                      {collector.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="w-full md:w-auto">
            <h3 className="mb-2">Date Filter</h3>
            <div>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy-MM-dd"
                className="py-2 px-4 w-full md:w-auto bg-[#0D0D11] text-white border border-gray-600 rounded-lg"
                isClearable
                popperPlacement="bottom-start"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-8 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2">
            No Cash Collection Records
          </h3>
          <p className="text-gray-400">
            {selectedCenter === "All"
              ? "There are no cash collection records available."
              : `There are no cash collection records for the selected center.`}
          </p>
          {selectedDate && (
            <p className="text-gray-400 mt-2">
              No records found for {format(selectedDate, "MMMM d, yyyy")}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 text-white min-h-screen">
      <p className="text-2xl font-bold mb-5">Cash Collection</p>

      <div className="flex flex-col md:flex-row md:gap-4 mb-4">
        <div className="relative mb-4 md:mb-0 w-full md:w-auto">
          <h3 className="mb-2">Centre Filter</h3>
          <div
            className="custom-dropdown center-dropdown"
            style={{ minWidth: "240px" }}
          >
            <button
              className="custom-dropdown-button"
              onClick={() => setCenterDropdownOpen(!centerDropdownOpen)}
            >
              <span>{selectedCenterObj.label}</span>
              <span className="ml-2">▼</span>
            </button>
            {centerDropdownOpen && (
              <div className="custom-dropdown-options">
                {centerOptions.map((center) => (
                  <div
                    key={center.value}
                    className="custom-dropdown-option"
                    onClick={() => handleCenterChange(center)}
                  >
                    {center.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="relative mb-4 md:mb-0 w-full md:w-auto">
          <h3 className="mb-2">Collected By</h3>
          <div
            className="custom-dropdown collector-dropdown"
            style={{ minWidth: "240px" }}
          >
            <button
              className="custom-dropdown-button"
              onClick={() => setCollectorDropdownOpen(!collectorDropdownOpen)}
            >
              <span>{selectedCollectorObj.label}</span>
              <span className="ml-2">▼</span>
            </button>
            {collectorDropdownOpen && (
              <div className="custom-dropdown-options">
                {collectorOptions.map((collector) => (
                  <div
                    key={collector.value}
                    className="custom-dropdown-option"
                    onClick={() => handleCollectorChange(collector)}
                  >
                    {collector.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="w-full md:w-auto">
          <h3 className="mb-2">Date Filter</h3>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="py-2 px-4 w-full md:w-auto bg-[#0D0D11] text-white border border-gray-600 rounded-lg"
            isClearable
          />
        </div>
      </div>
      <DataTable columns={columns} data={filteredData} />
    </div>
  );
};

export default CashCollection;
