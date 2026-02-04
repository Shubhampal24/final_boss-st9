import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RegionGraph = () => {
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [regionId, setRegionId] = useState("");
  const [regions, setRegions] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [graphLevel, setGraphLevel] = useState("month"); // Default to month view
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch available regions
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(`${BASE_URL}/api/regions/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setRegions(data);

        // Default to Mumbai region if available
        const mumbaiRegion = data.find((r) =>
          r.name.toLowerCase().includes("mumbai")
        );
        if (mumbaiRegion) {
          setRegionId(mumbaiRegion.id);
        }
      })
      .catch((error) => console.error("Error fetching regions:", error));
  }, []);

  // Fetch Sales & Clients Data
  useEffect(() => {
    if (!regionId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      let params = {
        regionId: regionId,
        year: selectedYear,
      };

      if (selectedMonth) params.month = selectedMonth;
      if (selectedWeek) params.week = selectedWeek;

      try {
        const salesRes = await axios.get(
          `${BASE_URL}/api/regions/monthly-sales`,
          {
            params,
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSalesData(salesRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [regionId, selectedYear, selectedMonth, selectedWeek, graphLevel]);

  const getChartData = (data, label, color, valueKey) => {
    if (graphLevel === "year") {
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const monthlyValues = months.map((month) => {
        const monthData = data.find((item) => item.month === month);
        return monthData ? monthData[valueKey] : 0;
      });

      return {
        labels: months.map((month) =>
          new Date(selectedYear, month - 1, 1).toLocaleString("default", {
            month: "long",
          })
        ),
        datasets: [
          {
            label,
            data: monthlyValues,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
            barThickness: 30,
          },
        ],
      };
    } else if (graphLevel === "month") {
      const weeksInMonth = 4;
      const weeklyValues = Array.from({ length: weeksInMonth }, (_, i) => {
        const weekData = data.find((item) => item.week === i + 1);
        return weekData ? weekData[valueKey] : 0;
      });

      return {
        labels: Array.from({ length: weeksInMonth }, (_, i) => `Week ${i + 1}`),
        datasets: [
          {
            label,
            data: weeklyValues,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
            barThickness: 30,
          },
        ],
      };
    } else if (graphLevel === "week") {
      const daysInWeek = 7;
      const dailyValues = Array.from({ length: daysInWeek }, (_, i) => {
        const dayData = data.find((item) => item.day === i + 1);
        return dayData ? dayData[valueKey] : 0;
      });

      return {
        labels: Array.from({ length: daysInWeek }, (_, i) => `Day ${i + 1}`),
        datasets: [
          {
            label,
            data: dailyValues,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
            barThickness: 30,
          },
        ],
      };
    }

    return { labels: [], datasets: [] };
  };

  const getSalesChartData = () =>
    getChartData(salesData, "Sales", "#6F5FE7", "totalSales");
  const getClientsChartData = () =>
    getChartData(salesData, "Clients", "#10B981", "totalCustomers");

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#ccc" },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#1A1A1F",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#444",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: "#444" },
        ticks: { color: "#ccc" },
      },
      y: {
        grid: { color: "#444" },
        ticks: { color: "#ccc" },
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full min-h-screen h-auto bg-[#0D0D11] px-5 text-white">
      <h2 className="text-2xl font-bold mt-6 mb-5">Region Graph View</h2>

      <div className="flex gap-4 mb-5 justify-between items-center">
        <select
          className="bg-[#1A1A1F] p-3 rounded-lg text-white w-full sm:w-1/3"
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
        >
          <option value="">Select Region</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>

        <select
          className="bg-[#1A1A1F] p-3 rounded-lg text-white w-full sm:w-1/3"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(parseInt(e.target.value));
            setGraphLevel("year");
            setSelectedMonth(null);
            setSelectedWeek(null);
          }}
        >
          {Array.from(
            { length: 5 },
            (_, i) => new Date().getFullYear() - i
          ).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {selectedYear && (
          <select
            className="bg-[#1A1A1F] p-3 rounded-lg text-white w-full sm:w-1/3"
            value={selectedMonth || ""}
            onChange={(e) => {
              const month = parseInt(e.target.value);
              setSelectedMonth(month);
              setGraphLevel("month");
              setSelectedWeek(null);
            }}
          >
            <option value="">Select Month</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <option key={month} value={month}>
                {new Date(selectedYear, month - 1, 1).toLocaleString(
                  "default",
                  {
                    month: "long",
                  }
                )}
              </option>
            ))}
          </select>
        )}

        {selectedMonth && (
          <select
            className="bg-[#1A1A1F] p-3 rounded-lg text-white w-full sm:w-1/3"
            value={selectedWeek || ""}
            onChange={(e) => {
              setSelectedWeek(parseInt(e.target.value));
              setGraphLevel("week");
            }}
          >
            <option value="">Select Week</option>
            {Array.from({ length: 4 }, (_, i) => i + 1).map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-6">
        <div className="bg-[#1A1A1F] p-6 rounded-lg shadow-lg w-full lg:w-1/2">
          <h3 className="text-lg font-semibold mb-3">Sales</h3>
          <div className="h-80">
            <Bar data={getSalesChartData()} options={options} />
          </div>
        </div>
        <div className="bg-[#1A1A1F] p-6 rounded-lg shadow-lg w-full lg:w-1/2">
          <h3 className="text-lg font-semibold mb-3">Clients</h3>
          <div className="h-80">
            <Bar data={getClientsChartData()} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionGraph;
