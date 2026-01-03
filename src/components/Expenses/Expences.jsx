import axios from "axios";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Toaster } from "react-hot-toast";
import NavbarRouting from "../dashboard/NavbarRouting";
import Loader from "../Loader";
import NavbarMain from "../NavbarMain";
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  CartesianGrid,
  BarChart, // <--- BarChart from recharts
  Bar,
}
  from "recharts";

// --- LUCIDE ICON IMPORTS ---
// Renamed BarChart to BarChartIcon to avoid conflict with recharts' BarChart
import { DollarSign, BarChart as BarChartIcon, TrendingUp, Tag, Percent, ArrowUp, ArrowDown } from "lucide-react";
// ---------------------------

// --- Constants ---
const PRIMARY_COLOR = "#3b82f6"; // Blue-500 - Total Business
const SECONDARY_COLOR = "#10b981"; // Emerald-500 - Revenue Score (Good)
const TERTIARY_COLOR = "#f59e0b"; // Amber-500 - Ad Expense / Other Expense
const QUATERNARY_COLOR = "#ef4444"; // Red-500 - Product Expense / Revenue Score (Bad)
const BASE_BG = "#0f172a"; // Slate-900

const colors = [PRIMARY_COLOR, TERTIARY_COLOR, SECONDARY_COLOR, QUATERNARY_COLOR];

// Helper to format currency for INR
const formatCurrency = (value) =>
  value?.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }) || "₹0";

// --- CenterFilterDropdown Component (Unchanged) ---
const CenterFilterDropdown = ({ centers, selectedCenter, setSelectedCenter }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredCenters = useMemo(() => {
    const allCentersOption = { id: "All", name: "All Centers" };
    const filtered = !searchTerm
      ? centers.map((c) => ({ id: c, name: c }))
      : centers
        .filter((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((c) => ({ id: c, name: c }));

    return [allCentersOption, ...filtered];
  }, [searchTerm, centers]);

  const handleSelect = (center) => {
    setSelectedCenter(center.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const currentSelectionName =
    selectedCenter === "All"
      ? "All Centers"
      : centers.find((c) => c === selectedCenter) || "All Centers";

  return (
    <div className="relative w-full text-white" ref={dropdownRef}>
      <div
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer border bg-gray-700 border-gray-600 rounded-lg p-2 flex justify-between items-center text-sm min-w-[120px] transition duration-200 hover:border-blue-500"
      >
        <span className="truncate">{currentSelectionName}</span>
        <svg
          className={`w-4 h-4 ml-1 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 border border-gray-600 shadow-xl min-w-[150px] right-0 sm:right-auto">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 border-b border-gray-700 bg-gray-900 text-white focus:outline-none rounded-t-md text-sm"
          />
          {filteredCenters.length === 0 ? (
            <div className="px-3 py-2 text-gray-400 text-xs">No centers found.</div>
          ) : (
            filteredCenters.map((center) => (
              <div
                key={center.id}
                onClick={() => handleSelect(center)}
                className={`cursor-pointer px-3 py-2 text-sm transition duration-150 ${selectedCenter === center.id
                    ? "bg-blue-600 text-white"
                    : "hover:bg-blue-700/50"
                  }`}
              >
                {center.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
// --- End of CenterFilterDropdown Component ---

// --- SummaryCards Component (UPDATED with Lucide Icons) ---
const SummaryCards = ({ data }) => {
  const { totalBusiness, adExpense, expense, productExpense, totalExpense } = useMemo(() => {
    const initial = {
      totalBusiness: 0,
      adExpense: 0,
      expense: 0,
      productExpense: 0,
    };

    const totals = data.reduce((acc, item) => ({
      totalBusiness: acc.totalBusiness + (item.totalBusiness || 0),
      adExpense: acc.adExpense + (item.adExpense || 0),
      expense: acc.expense + (item.expense || 0),
      productExpense: acc.productExpense + (item.productExpense || 0),
    }), initial);

    totals.totalExpense = totals.adExpense + totals.expense + totals.productExpense;

    return totals;
  }, [data]);

  // Calculation for Revenue Score (0-100)
  const revenueScore = useMemo(() => {
    if (totalExpense <= 0) {
      // If no expenses, assume perfect score or 100
      return totalBusiness > 0 ? 100 : 0;
    }
    // Heuristic: Score = min(100, (Total Business / Total Expenses) * 20)
    // The multiplier '20' is an arbitrary scaling factor for demonstration.
    const rawScore = (totalBusiness / totalExpense) * 20;
    return Math.min(100, Math.max(0, Math.round(rawScore)));
  }, [totalBusiness, totalExpense]);

  const scoreColor = revenueScore >= 80 ? SECONDARY_COLOR : revenueScore >= 50 ? TERTIARY_COLOR : QUATERNARY_COLOR;
  const scoreText = `${revenueScore}%`;

  const ScoreIcon = revenueScore >= 70 ? TrendingUp : ArrowDown;

  const cards = [
    {
      title: "Total Business/Revenue",
      value: formatCurrency(totalBusiness),
      color: PRIMARY_COLOR,
      Icon: DollarSign
    },
    {
      title: "Other Expense",
      value: formatCurrency(expense),
      color: TERTIARY_COLOR,
      Icon: Tag
    },
    {
      title: "Ad Expense",
      value: formatCurrency(adExpense),
      color: TERTIARY_COLOR,
      Icon: BarChartIcon // <--- CORRECTED: Using BarChartIcon
    },
    {
      title: "Product Expense",
      value: formatCurrency(productExpense),
      color: QUATERNARY_COLOR,
      Icon: ArrowUp
    },
    {
      title: "Revenue Score",
      value: scoreText,
      color: scoreColor,
      Icon: ScoreIcon
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="p-4 rounded-xl bg-gray-800/70 shadow-xl border border-gray-700 transition duration-300 hover:bg-gray-700/80 flex flex-col justify-between"
          style={{ borderLeft: `4px solid ${card.color}` }}
        >
          <p className="text-sm font-semibold text-gray-400 mb-1 flex items-center">
            <card.Icon className="w-4 h-4 mr-2" style={{ color: card.color }} />
            {card.title}
          </p>
          <p className="text-xl font-bold text-white truncate" style={{ color: card.color }}>
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};
// --- End of SummaryCards Component ---


// --- AnalysisTable Component (Unchanged) ---
const AnalysisTable = ({ data }) => {
  return (
    <div className="p-6 my-6 rounded-xl bg-gray-800/70 shadow-2xl backdrop-blur-sm">
      {/* <h3 className="text-2xl font-semibold mb-6 text-white text-center">
        Detailed Analysis Table
      </h3> */}
      <div className="overflow-x-auto overflow-y-auto max-h-[500px] border border-gray-700 rounded-lg">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="sticky top-0 bg-gray-900 z-10 border-b border-gray-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider border-r border-gray-700">#</th>
              <th className="px-3 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider border-r border-gray-700">Centre Code</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider border-r border-gray-700">Center Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider border-r border-gray-700">Region</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider border-r border-gray-700">Branch</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider border-r border-gray-700">Total Business</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider border-r border-gray-700">Ad Expense</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider border-r border-gray-700">Other Expense</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-300 uppercase tracking-wider">Product Expense</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr
                  key={item.index}
                  className="bg-gray-800/50 hover:bg-gray-700/70 transition duration-150"
                >
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-400 border-r border-gray-800">#{idx + 1}</td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-blue-400 border-r border-gray-800">{item.centreId || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium border-r border-gray-800">{item.centreName || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 border-r border-gray-800">
                    {item.region?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 border-r border-gray-800">
                    {item.branch?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-mono text-right border-r border-gray-800">{formatCurrency(item.totalBusiness)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-mono text-right border-r border-gray-800">{formatCurrency(item.adExpense)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-mono text-right border-r border-gray-800">{formatCurrency(item.expense)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-mono text-right">{formatCurrency(item.productExpense)}</td>
                </tr>
              ))
            ) : (
              <tr className="bg-gray-800/50">
                <td colSpan="9" className="px-6 py-12 text-center text-gray-500 text-lg">
                  No data available for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
// --- End of AnalysisTable Component ---

// --- AnalysisGraphSmooth (Area Chart) Component (Unchanged) ---
const AnalysisGraphSmooth = ({ data }) => {
  const formatXAxis = (index) => `#${index + 1}`;

  return (
    <div className="p-6 my-6 rounded-xl bg-gray-800/70 shadow-2xl backdrop-blur-sm overflow-x-auto">
      {/* <h3 className="text-2xl font-semibold mb-4 text-white text-center">
        Business & Expense Trend (Area Chart)
      </h3> */}
      {data.length > 0 ? (
        <>
          <div style={{ width: Math.max(data.length * 60, 600), height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis
                  dataKey="index"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={formatXAxis}
                  interval={0}
                  height={60}
                  label={{
                    value: "Centers (Ranked Index)",
                    position: "insideBottom",
                    offset: 0,
                    fill: "#94a3b8",
                  }}
                />
                <YAxis
                  tick={{ fill: "#94a3b8" }}
                  tickFormatter={(value) => formatCurrency(value)}
                  width={100}
                  label={{
                    value: "Amount (₹)",
                    angle: -90,
                    position: "insideLeft",
                    dy: 10,
                    fill: "#94a3b8",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: BASE_BG,
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value, name) => [formatCurrency(value), name]}
                  labelFormatter={(label) => {
                    const centerData = data.find((d) => d.index === label);
                    const centerName = centerData?.centreName || `Center #${label + 1}`;
                    const centerCode = centerData?.centreId || 'N/A';
                    const regionName = centerData?.region?.name || 'N/A';
                    const branchName = centerData?.branch?.name || 'N/A';

                    return [
                      <span key="name">{`Center: ${centerName} (Code: ${centerCode})`}</span>,
                      <br key="sep1" />,
                      <span key="region">{`Region: ${regionName}`}</span>,
                      <br key="sep2" />,
                      <span key="branch">{`Branch: ${branchName}`}</span>,
                    ];
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "#94a3b8", paddingTop: "10px" }}
                  verticalAlign="top"
                  height={36}
                />
                <Area
                  type="monotone"
                  dataKey="totalBusiness"
                  name="Total Business"
                  stroke={colors[0]}
                  fill={colors[0]}
                  fillOpacity={0.4}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="adExpense"
                  name="Ad Expense"
                  stroke={colors[1]}
                  fill={colors[1]}
                  fillOpacity={0.4}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Other Expense"
                  stroke={colors[2]}
                  fill={colors[2]}
                  fillOpacity={0.4}
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="productExpense"
                  name="Product Expense"
                  stroke={colors[3]}
                  fill={colors[3]}
                  fillOpacity={0.4}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center mt-3 text-gray-400 text-sm">
            Curves show performance across all selected centers.
          </p>
        </>
      ) : (
        <div className="text-center text-gray-500 h-80 flex items-center justify-center text-lg">
          No graph data available for the selected filters.
        </div>
      )}
    </div>
  );
};
// --- End of AnalysisGraphSmooth Component ---

// --- AnalysisGraphBar (Bar Chart) Component (Unchanged) ---
const AnalysisGraphBar = ({ data }) => {
  const formatXAxis = (index) => `#${index + 1}`;

  return (
    <div className="p-6 my-6 rounded-xl bg-gray-800/70 shadow-2xl backdrop-blur-sm overflow-x-auto">
      {/* <h3 className="text-2xl font-semibold mb-4 text-white text-center">
        Center-wise Business & Expense (Bar Chart)
      </h3> */}
      {data.length > 0 ? (
        <>
          <div style={{ width: Math.max(data.length * 60, 600), height: 380 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
                barCategoryGap="10%"
              >
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis
                  dataKey="index"
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={formatXAxis}
                  interval={0}
                  height={60}
                  label={{
                    value: "Centers (Ranked Index)",
                    position: "insideBottom",
                    offset: 0,
                    fill: "#94a3b8",
                  }}
                />
                <YAxis
                  tick={{ fill: "#94a3b8" }}
                  tickFormatter={(value) => formatCurrency(value)}
                  width={100}
                  label={{
                    value: "Amount (₹)",
                    angle: -90,
                    position: "insideLeft",
                    dy: 10,
                    fill: "#94a3b8",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: BASE_BG,
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value, name) => [formatCurrency(value), name]}
                  labelFormatter={(label) => {
                    const centerData = data.find((d) => d.index === label);
                    const centerName = centerData?.centreName || `Center #${label + 1}`;
                    const centerCode = centerData?.centreId || 'N/A';
                    const regionName = centerData?.region?.name || 'N/A';
                    const branchName = centerData?.branch?.name || 'N/A';

                    return [
                      <span key="name">{`Center: ${centerName} (Code: ${centerCode})`}</span>,
                      <br key="sep1" />,
                      <span key="region">{`Region: ${regionName}`}</span>,
                      <br key="sep2" />,
                      <span key="branch">{`Branch: ${branchName}`}</span>,
                    ];
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "#94a3b8", paddingTop: "10px" }}
                  verticalAlign="top"
                  height={36}
                />
                <Bar dataKey="totalBusiness" name="Total Business" fill={colors[0]} />
                <Bar dataKey="adExpense" name="Ad Expense" fill={colors[1]} />
                <Bar dataKey="expense" name="Other Expense" fill={colors[2]} />
                <Bar dataKey="productExpense" name="Product Expense" fill={colors[3]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center mt-3 text-gray-400 text-sm">
            Bars show specific values for each center.
          </p>
        </>
      ) : (
        <div className="text-center text-gray-500 h-80 flex items-center justify-center text-lg">
          No graph data available for the selected filters.
        </div>
      )}
    </div>
  );
};
// --- End of AnalysisGraphBar Component ---

// --- DailyExpenses Main Component (Unchanged logic) ---
const DailyExpenses = () => {
  const [selectedCenter, setSelectedCenter] = useState("All");

  const [period, setPeriod] = useState("monthly");

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [quarter, setQuarter] = useState("Q1");

  const [centerOptions, setCenterOptions] = useState([]);
  const [analysisData, setAnalysisData] = useState([]);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState(null);

  const [view, setView] = useState("graph"); // 'graph' or 'table'
  const [graphType, setGraphType] = useState("area"); // 'area' or 'bar'

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAnalysisError("Authentication token is missing.");
      setAnalysisLoading(false);
      return;
    }
    const fetchAnalysis = async () => {
      setAnalysisLoading(true);
      try {
        const params = { period, year };
        if (period === "monthly") params.month = month;
        else if (period === "quarterly") params.quarter = quarter;

        const response = await axios.get(`${BASE_URL}/api/centres/centres/analysis`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        const rawData = response.data.data || [];
        setAnalysisData(rawData);

        const centerNames = [...new Set(rawData.map((d) => d.centreName).filter(Boolean))];
        setCenterOptions(centerNames);

        setAnalysisError(null);
      } catch (error) {
        console.error("Fetch analysis error:", error);
        setAnalysisError("Failed to fetch analysis data. Please check the network and server.");
      } finally {
        setAnalysisLoading(false);
      }
    };
    fetchAnalysis();
  }, [period, year, month, quarter, BASE_URL]);

  const filteredAnalysis = useMemo(() => {
    return analysisData
      .filter(
        (item) =>
          selectedCenter === "All" || item.centreName === selectedCenter
      )
      .sort((a, b) => {
        // Sort by Region Name first (A-Z)
        const regionA = a.region?.name || "";
        const regionB = b.region?.name || "";

        if (regionA < regionB) return -1;
        if (regionA > regionB) return 1;

        // If Region Names are equal, sort by Centre Name (A-Z)
        const centreA = a.centreName || "";
        const centreB = b.centreName || "";

        if (centreA < centreB) return -1;
        if (centreA > centreB) return 1;

        return 0; // Maintain original order if both are identical
      })
      .map((item, index) => ({ index, ...item }));
  }, [analysisData, selectedCenter]);


  const handlePeriodChange = (e) => setPeriod(e.target.value);
  const handleYearChange = (e) => setYear(Number(e.target.value));
  const handleMonthChange = (e) => setMonth(Number(e.target.value));
  const handleQuarterChange = (e) => setQuarter(e.target.value);

  const handleViewChange = (newView) => setView(newView);
  const handleGraphTypeChange = (newType) => setGraphType(newType);

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Reusable Select component for cleaner filter section
  const FilterSelect = ({ id, value, onChange, options }) => (
    <select
      id={id}
      value={value}
      onChange={onChange}
      className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none text-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200"
      style={{ minWidth: '100px' }} // Control select width
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className={`w-full min-h-screen ${BASE_BG} px-4 md:px-12 py-5`}>
      <Toaster position="top-center" reverseOrder={false} />
      <NavbarMain />
      <NavbarRouting />

      {/* --- Single-Line Filter and Toggle Controls --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-3 rounded-xl bg-gray-900/50 shadow-lg">

        {/* LEFT SIDE: Filter Section */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-gray-300 text-sm font-semibold hidden sm:inline">Filter By:</span>

          {/* Period Select */}
          <div className="w-auto" title="Period">
            <FilterSelect
              id="period"
              value={period}
              onChange={handlePeriodChange}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "quarterly", label: "Quarterly" },
                { value: "yearly", label: "Yearly" },
              ]}
            />
          </div>

          {/* Year Select */}
          <div className="w-auto" title="Year">
            <FilterSelect
              id="year"
              value={year}
              onChange={handleYearChange}
              options={yearOptions.map((yr) => ({ value: yr, label: yr }))}
            />
          </div>

          {/* Conditional Selects */}
          {period === "monthly" && (
            <div className="w-auto" title="Month">
              <FilterSelect
                id="month"
                value={month}
                onChange={handleMonthChange}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: i + 1,
                  label: new Date(0, i).toLocaleString("default", { month: "short" }),
                }))}
              />
            </div>
          )}
          {period === "quarterly" && (
            <div className="w-auto" title="Quarter">
              <FilterSelect
                id="quarter"
                value={quarter}
                onChange={handleQuarterChange}
                options={[
                  { value: "Q1", label: "Q1" },
                  { value: "Q2", label: "Q2" },
                  { value: "Q3", label: "Q3" },
                  { value: "Q4", label: "Q4" },
                ]}
              />
            </div>
          )}

          {/* Center Dropdown */}
          <div className="w-auto flex-shrink-0" title="Center Selection">
            <CenterFilterDropdown
              centers={centerOptions}
              selectedCenter={selectedCenter}
              setSelectedCenter={setSelectedCenter}
            />
          </div>
        </div>

        {/* RIGHT SIDE: View and Graph Toggles */}
        <div className="flex flex-wrap items-center gap-3 ml-auto">

          {/* View Toggle (Graph/Table) */}
          <div className="flex rounded-lg border border-gray-600 p-1 bg-gray-800 flex-shrink-0" title="View Type">
            <button
              onClick={() => handleViewChange("graph")}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors duration-200 ${view === "graph"
                  ? `bg-blue-600 text-white shadow-md`
                  : "text-gray-300 hover:bg-gray-700"
                }`}
            >
              Graph
            </button>
            <button
              onClick={() => handleViewChange("table")}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors duration-200 ${view === "table"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-700"
                }`}
            >
              Table
            </button>
          </div>

          {/* Graph Type Toggle (Area/Bar) - Only visible in Graph View */}
          {view === "graph" && (
            <div className="flex rounded-lg border border-gray-600 p-1 bg-gray-800 flex-shrink-0" title="Graph Style">
              <button
                onClick={() => handleGraphTypeChange("area")}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors duration-200 ${graphType === "area"
                    ? `bg-emerald-600 text-white shadow-md`
                    : "text-gray-300 hover:bg-gray-700"
                  }`}
              >
                Area
              </button>
              <button
                onClick={() => handleGraphTypeChange("bar")}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors duration-200 ${graphType === "bar"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-700"
                  }`}
              >
                Bar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- Summary Cards --- */}
      {!analysisLoading && !analysisError && (
        <SummaryCards data={filteredAnalysis} />
      )}

      {/* --- Main Content Area --- */}
      {analysisLoading ? (
        <div className="py-20">
          <Loader />
        </div>
      ) : analysisError ? (
        <div className="p-10 my-6 rounded-xl bg-red-900/30 border border-red-700">
          <p className="text-red-400 text-center text-lg">{analysisError}</p>
        </div>
      ) : view === "graph" ? (
        graphType === "area" ? (
          <AnalysisGraphSmooth data={filteredAnalysis} />
        ) : (
          <AnalysisGraphBar data={filteredAnalysis} />
        )
      ) : (
        <AnalysisTable data={filteredAnalysis} />
      )}
    </div>
  );
};

export default DailyExpenses;