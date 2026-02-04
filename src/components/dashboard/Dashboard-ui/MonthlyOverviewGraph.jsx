import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MonthlyOverviewGraph = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeDataView, setActiveDataView] = useState("totalRevenue");

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Use keys matching your API data renamed for chart
  const fallbackMonthlyData = monthNames.map((month, index) => ({
    month,
    revenue: 0,
    cashRevenue: 0,
    onlineRevenue: 0,
    customers: 0,
    monthNum: index + 1,
  }));

  const shortenNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toFixed(0);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-300 shadow-lg rounded-lg">
          <p className="font-bold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{ color: entry.color }}
              className="font-semibold"
            >
              {entry.name}:{" "}
              {entry.dataKey === "customers"
                ? shortenNumber(entry.value)
                : `₹${shortenNumber(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const fetchMonthlyData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${BASE_URL}/api/customers/revenue?year=${selectedYear}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const monthDataMap = {};
        if (response.data && response.data.monthlyRevenue) {
          response.data.monthlyRevenue.forEach((item) => {
            const monthNum = parseInt(item.id.split("-")[1], 10);
            const month = monthNames[monthNum - 1];
            monthDataMap[month] = {
              month,
              revenue: item.totalRevenue || 0,
              cashRevenue: item.totalCash || 0, // Correct key name here
              onlineRevenue: item.totalOnline || 0, // Correct key name here
              customers: item.customerCount || 0,
              monthNum,
            };
          });
        }

        // Map fallback with actual or fallback
        const fullData = fallbackMonthlyData.map((fallbackMonth) => {
          return monthDataMap[fallbackMonth.month] || fallbackMonth;
        });

        setMonthlyData(fullData);
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error("Error fetching monthly data:", error);
        setMonthlyData(fallbackMonthlyData);
        setError("Failed to load monthly data.");
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, [BASE_URL, selectedYear]);

  const totalAnnualRevenue = monthlyData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );
  const totalCustomers = monthlyData.reduce(
    (sum, item) => sum + (item.customers || 0),
    0
  );

  const highestRevenueMonth =
    monthlyData.length > 0
      ? monthlyData.reduce((max, item) =>
          item.revenue > max.revenue ? item : max
        )
      : { month: "N/A", revenue: 0 };

  let lowestRevenueMonth =
    monthlyData.length > 0
      ? monthlyData
          .filter((item) => item.revenue > 0)
          .reduce((min, item) => (item.revenue < min.revenue ? item : min), {
            month: "N/A",
            revenue: Number.MAX_SAFE_INTEGER,
          })
      : { month: "N/A", revenue: 0 };

  if (lowestRevenueMonth.revenue === Number.MAX_SAFE_INTEGER) {
    lowestRevenueMonth = { month: "N/A", revenue: 0 };
  }

  const YearSelector = () => (
    <div className="w-full md:w-1/4 px-4">
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
      >
        {[...Array(5)].map((_, i) => {
          const year = new Date().getFullYear() - 2 + i;
          return (
            <option key={year} value={year}>
              {year}
            </option>
          );
        })}
      </select>
    </div>
  );

  const handleDataViewChange = (view) => setActiveDataView(view);

  if (loading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // DEBUG - Uncomment if you want to verify data and view in console
  // console.log("Monthly Data:", monthlyData);
  // console.log("Active View:", activeDataView);

  return (
    <div className="w-full py-10 px-4 sm:px-6 lg:px-32">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            Revenue Overview
          </h2>
          <p className="text-gray-100 max-w-2xl mx-auto py-5">
            Monthly revenue breakdown for the year, showcasing financial
            performance across different months.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-stretch md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-10">
          <YearSelector />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10 text-center">
          <div className="bg-[#1F1F24] p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Total Annual Revenue
            </h3>
            <p className="text-2xl font-bold text-green-600">
              ₹ {shortenNumber(totalAnnualRevenue)}
            </p>
          </div>
          <div className="bg-[#1F1F24] p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Total Customers
            </h3>
            <p className="text-2xl font-bold text-orange-600">
              {shortenNumber(totalCustomers)}
            </p>
          </div>
          <div className="bg-[#1F1F24] p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Highest Revenue Month
            </h3>
            <p className="text-xl font-bold text-blue-600">
              {highestRevenueMonth.month}
            </p>
          </div>
          <div className="bg-[#1F1F24] p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              Lowest Revenue Month
            </h3>
            <p className="text-xl font-bold text-red-500">
              {lowestRevenueMonth.month}
            </p>
          </div>
        </div>

        <div className="bg-[#1F1F24] p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 60, bottom: 70 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="month"
                interval={0}
                angle={-45}
                textAnchor="end"
                axisLine={{ stroke: "#a0a0a0" }}
                tickLine={{ stroke: "#a0a0a0" }}
                tick={{ fill: "#a0a0a0", fontSize: 12 }}
                height={60}
              />
              <YAxis
                tickFormatter={shortenNumber}
                label={{
                  value:
                    activeDataView === "customers"
                      ? "Customers"
                      : "Revenue (₹)",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
                axisLine={{ stroke: "#a0a0a0" }}
                tickLine={{ stroke: "#a0a0a0" }}
                tick={{ fill: "#a0a0a0" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#a0a0a0" }} />
              {activeDataView === "totalRevenue" && (
                <Bar
                  dataKey="revenue"
                  fill="#6F5FE7"
                  name="Total Revenue"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              )}
              {activeDataView === "cashVsOnline" && (
                <>
                  <Bar
                    dataKey="cashRevenue"
                    fill="#4CAF50"
                    name="Cash Revenue"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <Bar
                    dataKey="onlineRevenue"
                    fill="#2196F3"
                    name="Online Revenue"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </>
              )}
              {activeDataView === "customers" && (
                <Bar
                  dataKey="customers"
                  fill="#FF5722"
                  name="Customer Count"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              )}
              {activeDataView === "totalCash" && (
                <Bar
                  dataKey="cashRevenue"
                  fill="#8884d8"
                  name="Total Cash Revenue"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              )}
              {activeDataView === "totalOnline" && (
                <Bar
                  dataKey="onlineRevenue"
                  fill="#82ca9d"
                  name="Total Online Revenue"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              )}
            </BarChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap justify-center mt-6 gap-4">
            <button
              className={`px-4 py-2 text-sm sm:text-base ${
                activeDataView === "totalRevenue"
                  ? "bg-purple-600"
                  : "bg-gray-800"
              } text-white rounded border border-gray-600 hover:bg-gray-700`}
              onClick={() => handleDataViewChange("totalRevenue")}
            >
              Total Revenue
            </button>
            {/* <button
                            className={`px-4 py-2 text-sm sm:text-base ${activeDataView === 'cashVsOnline' ? 'bg-purple-600' : 'bg-gray-800'} text-white rounded border border-gray-600 hover:bg-gray-700`}
                            onClick={() => handleDataViewChange('cashVsOnline')}>
                            Cash vs Online
                        </button> */}
            <button
              className={`px-4 py-2 text-sm sm:text-base ${
                activeDataView === "customers" ? "bg-purple-600" : "bg-gray-800"
              } text-white rounded border border-gray-600 hover:bg-gray-700`}
              onClick={() => handleDataViewChange("customers")}
            >
              Customers
            </button>
            <button
              className={`px-4 py-2 text-sm sm:text-base ${
                activeDataView === "totalCash" ? "bg-purple-600" : "bg-gray-800"
              } text-white rounded border border-gray-600 hover:bg-gray-700`}
              onClick={() => handleDataViewChange("totalCash")}
            >
              Total Cash
            </button>
            <button
              className={`px-4 py-2 text-sm sm:text-base ${
                activeDataView === "totalOnline"
                  ? "bg-purple-600"
                  : "bg-gray-800"
              } text-white rounded border border-gray-600 hover:bg-gray-700`}
              onClick={() => handleDataViewChange("totalOnline")}
            >
              Total Online
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyOverviewGraph;
