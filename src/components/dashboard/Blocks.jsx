import React, { useState, useEffect } from "react";
import { FaArrowRightLong } from "react-icons/fa6";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const Blocks = ({ setSelectedSection, selectedTab }) => {
  const [blocksData, setBlocksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Date selection states
  const [dateMode, setDateMode] = useState("single"); // 'single', 'month', 'quarter', 'custom'
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });

  // Quarter selection state
  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    return `Q${quarter}-${year}`;
  });

  // Custom date range states
  const [customStartDate, setCustomStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [customEndDate, setCustomEndDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();

  // Helper function to ensure date is in YYYY-MM-DD format
  const formatDateForAPI = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper function to generate quarter options
  const generateQuarterOptions = () => {
    const currentYear = new Date().getFullYear();
    const quarters = [
      { value: `Q1-${currentYear}`, label: "Jan-Mar" },
      { value: `Q2-${currentYear}`, label: "Apr-Jun" },
      { value: `Q3-${currentYear}`, label: "Jul-Sep" },
      { value: `Q4-${currentYear}`, label: "Oct-Dec" },
    ];

    return quarters;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token is missing.");
          setLoading(false);
          return;
        }

        let apiUrl = `${BASE_URL}/api/customers/dashboard-blocks`;
        let params = {};

        // Build API parameters based on selected date mode - ensure YYYY-MM-DD format
        switch (dateMode) {
          case "single":
            params.date = formatDateForAPI(selectedDate);
            break;
          // case 'range':
          //     params.startDate = formatDateForAPI(startDate);
          //     params.endDate = formatDateForAPI(endDate);
          //     break;
          case "month":
            params.month = selectedMonth; // Month format is already YYYY-MM
            break;
          case "quarter":
            params.quarter = selectedQuarter; // Quarter format is already Q1-YYYY
            break;
          case "custom":
            params.startDate = formatDateForAPI(customStartDate);
            params.endDate = formatDateForAPI(customEndDate);
            break;
          default:
            params.date = formatDateForAPI(selectedDate);
        }

        const queryString = new URLSearchParams(params).toString();
        const fullUrl = `${apiUrl}?${queryString}`;

        const dashboardResponse = await axios.get(fullUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // For center status, use appropriate date parameter - ensure YYYY-MM-DD format
        let centerStatusUrl = `${BASE_URL}/api/centres/zero-entry-centres`;
        let centerParams = {};

        if (dateMode === "single") {
          centerParams.date = formatDateForAPI(selectedDate);
        }
        // else if (dateMode === 'range') {
        //     centerParams.startDate = formatDateForAPI(startDate);
        //     centerParams.endDate = formatDateForAPI(endDate);
        // }
        else if (dateMode === "month") {
          centerParams.month = selectedMonth; // Month format is already YYYY-MM
        } else if (dateMode === "quarter") {
          centerParams.quarter = selectedQuarter; // Quarter format is already Q1-YYYY
        } else if (dateMode === "custom") {
          centerParams.startDate = formatDateForAPI(customStartDate);
          centerParams.endDate = formatDateForAPI(customEndDate);
        }

        const centerQueryString = new URLSearchParams(centerParams).toString();
        const centerFullUrl = `${centerStatusUrl}?${centerQueryString}`;

        const centerStatusResponse = await axios.get(centerFullUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const dashboardData = dashboardResponse.data;
        const { activeCentreCount = 0, inactiveCentreCount = 0 } =
          centerStatusResponse.data;

        if (dashboardData && Array.isArray(dashboardData)) {
          let updatedData = [...dashboardData];

          updatedData = updatedData.map((item) => {
            if (item.title.toLowerCase().includes("inactive")) {
              return {
                ...item,
                title: "Center Status",
                value: `Active: ${activeCentreCount} | Inactive: ${inactiveCentreCount}`,
              };
            }
            return item;
          });

          setBlocksData(updatedData);
        } else {
          setError("Invalid API response format");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [
    selectedTab,
    dateMode,
    selectedDate,
    startDate,
    endDate,
    selectedMonth,
    selectedQuarter,
    customStartDate,
    customEndDate,
  ]);

  const handleDateModeChange = (e) => {
    setDateMode(e.target.value);
    setError(null); // Clear any existing errors
  };

  const handleSingleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
    // Ensure end date is not before start date
    if (e.target.value > endDate) {
      setEndDate(e.target.value);
    }
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleQuarterChange = (e) => {
    setSelectedQuarter(e.target.value);
  };

  const handleCustomStartDateChange = (e) => {
    setCustomStartDate(e.target.value);
    // Ensure custom end date is not before start date
    if (e.target.value > customEndDate) {
      setCustomEndDate(e.target.value);
    }
  };

  const handleCustomEndDateChange = (e) => {
    setCustomEndDate(e.target.value);
  };

  const handleCashCollectionClick = () => {
    navigate("/cash-collection");
  };

  const getDateDisplayText = () => {
    switch (dateMode) {
      case "single":
        const today = new Date().toISOString().split("T")[0];
        return selectedDate === today ? "Today's" : "Selected Date's";
      case "month":
        const [year, month] = selectedMonth.split("-");
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      case "quarter":
        const [quarter, qYear] = selectedQuarter.split("-");
        const quarterLabels = {
          Q1: "Jan-Mar",
          Q2: "Apr-Jun",
          Q3: "Jul-Sep",
          Q4: "Oct-Dec",
        };
        return `${quarterLabels[quarter]} ${qYear}`;
      case "custom":
        const formatDate = (dateStr) => {
          const date = new Date(dateStr);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
        };

        if (customStartDate === customEndDate) {
          return `${formatDate(customStartDate)}`;
        } else {
          return `${formatDate(customStartDate)} - ${formatDate(
            customEndDate
          )}`;
        }
      default:
        return "Selected Period";
    }
  };

  return (
    <div className="w-full mt-10 pr-15 font-[Plus] h-auto">
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-4">
{/* Date Selection Section - Complete UI for all modes */}
<div className="flex flex-wrap items-center gap-4 bg-[#1F1F24] p-2 rounded-2xl border border-white/5">
 <div className="relative">
    <select
      id="dateMode"
      value={dateMode}
      onChange={handleDateModeChange}
      className="appearance-none pl-4 pr-10 py-2.5 rounded-xl bg-[#2A2A30] text-white text-sm font-medium focus:outline-none transition-all cursor-pointer min-w-[160px]"
    >
      <option value="single">Single Date</option>
      <option value="month">Month View</option>
      <option value="quarter">Quarterly View</option>
      <option value="custom">Custom Range</option>
    </select>
    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
</div>



  {/* SINGLE DATE MODE */}
  {dateMode === "single" && (
    <input
      id="datePicker"
      type="date"
      value={selectedDate}
      onChange={handleSingleDateChange}
      className="px-4 py-2.5 rounded-xl bg-[#2A2A30] text-white text-sm border border-transparent focus:border-[#6F5FE7] focus:outline-none transition-all"
    />
  )}

  {/* MONTH MODE */}
  {dateMode === "month" && (
    <input
      id="monthPicker"
      type="month"
      value={selectedMonth}
      onChange={handleMonthChange}
      className="px-4 py-2.5 rounded-xl bg-[#2A2A30] text-white text-sm border border-transparent focus:border-[#6F5FE7] focus:outline-none"
    />
  )}

  {/* QUARTERLY MODE */}
  {dateMode === "quarter" && (
    <div className="px-4 py-2.5 rounded-xl bg-[#2A2A30] text-white text-sm border border-transparent focus:border-[#6F5FE7] focus:outline-none">
      <select
        id="quarterPicker"
        value={selectedQuarter}
        onChange={handleQuarterChange}
        className="bg-transparent border-0 focus:outline-none cursor-pointer w-full text-white"
      >
        {generateQuarterOptions().map((option) => (
          <option key={option.value} value={option.value} className="bg-[#1A1A1F]">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )}

  {/* CUSTOM RANGE MODE */}
  {dateMode === "custom" && (
    <>
      <input
        type="date"
        value={customStartDate}
        onChange={handleCustomStartDateChange}
        className="px-4 py-2.5 rounded-xl bg-[#2A2A30] text-white text-sm border border-transparent focus:border-[#6F5FE7] focus:outline-none"
      />
      <span className="text-gray-500 font-medium">-</span>
      <input
        type="date"
        value={customEndDate}
        min={customStartDate}
        onChange={handleCustomEndDateChange}
        className="px-4 py-2.5 rounded-xl bg-[#2A2A30] text-white text-sm border border-transparent focus:border-[#6F5FE7] focus:outline-none"
      />
    </>
  )}


          {/* Cash Collection Button */}
          <button
            onClick={handleCashCollectionClick}
            className="ml-2 px-4 py-2 rounded-lg bg-[#6F5FE7] text-white hover:bg-[#5a4bc4] transition-colors"
          >
            Collect Cash
          </button>
        </div>
      </div>
    </div>

      <div className="grid grid-cols-4 justify-start items-center gap-6">
        {error && (
          <div className="col-span-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-white mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="col-span-4 text-center text-white">
            <div className="animate-pulse">Loading dashboard data...</div>
          </div>
        ) : (
          blocksData
            .filter((block) => {
              return !(
                selectedTab === "inactive" && block.title === "Center Status"
              );
            })
            .map((block) => {
              let targetSection = block.section;
              let displayTitle = block.title;

              // Update titles based on date mode and current selection
              const dateText = getDateDisplayText();

              const title = block.title;

              if (title.endsWith("Customers")) {
                targetSection = "customers";
                displayTitle = `${dateText} Customers`;
              } else if (title.endsWith("Online Payments")) {
                targetSection = "online-collection";
                displayTitle = `${dateText} Online Payments`;
              } else if (title.endsWith("Cash Payments")) {
                targetSection = "/";
                displayTitle = `${dateText} Cash Payments`;
              } else if (title.endsWith("Total Payments")) {
                targetSection = "total-collection";
                displayTitle = `${dateText} Total Payments`;
              } else if (title.endsWith("Commission")) {
                targetSection = "commission";
                displayTitle = `${dateText} Commission`;
              } else if (title === "All Centers") {
                targetSection = "center-active";
                displayTitle = "All Centers";
              } else if (title === "Center Status") {
                targetSection = "center-inactive";
                displayTitle = "Center Status";

                // store date context
                if (dateMode === "single") {
                  localStorage.setItem(
                    "centerStatusDate",
                    formatDateForAPI(selectedDate)
                  );
                } else if (dateMode === "month") {
                  localStorage.setItem("centerStatusMonth", selectedMonth);
                } else if (dateMode === "quarter") {
                  localStorage.setItem("centerStatusQuarter", selectedQuarter);
                } else if (dateMode === "custom") {
                  localStorage.setItem(
                    "centerStatusStartDate",
                    formatDateForAPI(customStartDate)
                  );
                  localStorage.setItem(
                    "centerStatusEndDate",
                    formatDateForAPI(customEndDate)
                  );
                }
              } else if (title === "Area Manager Collection") {
                targetSection = "cash-collection";
                displayTitle = "Area Manager Collection";
              } else {
                targetSection = block.section;
                displayTitle = block.title;
              }

              return (
                 <div
                  key={block.id}
                  onClick={() => setSelectedSection(targetSection)}
                  className="group cursor-pointer relative overflow-hidden rounded-2xl border border-white/10 bg-[#1A1A1F] p-6 transition-all duration-300 hover:border-[#6F5FE7] hover:shadow-[0_0_20px_rgba(111,95,231,0.15)]"
                >
                  {/* Icon - Top Left */}
                  <div className="w-12 h-12 rounded-xl bg-[#6F5FE7]/10 flex items-center justify-center mb-6">
                    <div className="text-[#6F5FE7]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <line x1="2" y1="10" x2="22" y2="10"/>
                      </svg>
                    </div>
                  </div>

                  {/* Arrow - Top Right - Shows on Hover */}
                  <FaArrowRightLong 
                    size={20} 
                    className="absolute top-6 right-6 text-[#6F5FE7] opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                  />

                  {/* Value */}
                  <h3 className="text-2xl font-bold mb-2 text-white">
                    {block.value}
                  </h3>

                  {/* Title */}
                  <p className="text-sm text-gray-400">
                    {displayTitle}
                  </p>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default Blocks;
