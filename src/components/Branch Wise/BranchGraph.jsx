import React, { useState, useEffect } from "react";
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
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BranchGraph = () => {
  const [salesData, setSalesData] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [graphLevel, setGraphLevel] = useState("month"); // default to month view
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(`${BASE_URL}/api/branches/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setBranches(data);
      })
      .catch((error) => console.error("Error fetching branches:", error));
  }, []);

  useEffect(() => {
    if (!branchId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      const params = {
        branchId,
        year: selectedYear,
      };
      if (selectedMonth) params.month = selectedMonth;
      if (selectedWeek) params.week = selectedWeek;

      try {
        const res = await axios.get(`${BASE_URL}/api/branches/combined-sales`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
        setSalesData(res.data || []);
      } catch (error) {
        console.error("Error fetching branch sales data:", error);
      }
    };

    fetchData();
  }, [branchId, selectedYear, selectedMonth, selectedWeek, graphLevel]);

  const getChartData = (data, label, color, valueKey) => {
    if (graphLevel === "year") {
      const months = Array.from({ length: 12 }, (_, i) => i + 1);
      const values = months.map((month) => {
        const entry = data.find((d) => d.month === month);
        return entry ? entry[valueKey] : 0;
      });

      return {
        labels: months.map((month) =>
          new Date(selectedYear, month - 1).toLocaleString("default", {
            month: "long",
          })
        ),
        datasets: [
          {
            label,
            data: values,
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

    if (graphLevel === "month") {
      const weeks = Array.from({ length: 4 }, (_, i) => i + 1);
      const values = weeks.map((week) => {
        const entry = data.find((d) => d.week === week);
        return entry ? entry[valueKey] : 0;
      });

      return {
        labels: weeks.map((w) => `Week ${w}`),
        datasets: [
          {
            label,
            data: values,
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

    if (graphLevel === "week") {
      const days = Array.from({ length: 7 }, (_, i) => i + 1);
      const values = days.map((day) => {
        const entry = data.find((d) => d.day === day);
        return entry ? entry[valueKey] : 0;
      });

      return {
        labels: days.map((d) => `Day ${d}`),
        datasets: [
          {
            label,
            data: values,
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
    getChartData(salesData, "Clients", "#10B981", "customerCount");

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
      <h2 className="text-2xl font-bold mt-6 mb-5">Area Graph View</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-5">
        <select
          className="bg-[#1A1A1F] p-3 rounded-lg text-white flex-1"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
        >
          <option value="">Select Branch</option>
          {branches.map((branch) => (
            <option key={branch._id} value={branch._id}>
              {branch.name}
            </option>
          ))}
        </select>

        <select
          className="bg-[#1A1A1F] p-3 rounded-lg text-white flex-1"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(parseInt(e.target.value));
            setGraphLevel("year");
            setSelectedMonth(null);
            setSelectedWeek(null);
          }}
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(
            (year) => (
              <option key={year} value={year}>
                {year}
              </option>
            )
          )}
        </select>

        <select
          className="bg-[#1A1A1F] p-3 rounded-lg text-white flex-1"
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
              {new Date(selectedYear, month - 1, 1).toLocaleString("default", {
                month: "long",
              })}
            </option>
          ))}
        </select>

        <select
          className="bg-[#1A1A1F] p-3 rounded-lg text-white flex-1"
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

export default BranchGraph;
