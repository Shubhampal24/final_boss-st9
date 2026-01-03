import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import { CiViewTable } from "react-icons/ci";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CenterGraph = () => {
    const navigate = useNavigate();
    const [salesData, setSalesData] = useState([]);
    const [clientsData, setClientsData] = useState([]);
    const [centerId, setCenterId] = useState("");
    const [centers, setCenters] = useState([]);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;

        axios.get(`${BASE_URL}/api/centres/`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(response => {
                setCenters(Array.isArray(response.data) ? response.data : []);
            })
            .catch(error => console.error("Error fetching centers:", error));
    }, []);

    useEffect(() => {   
        if (!centerId.trim()) return;
        const token = localStorage.getItem("token");
        if (!token) return;
    
        const fetchData = async () => {
            try {
                const [salesRes, clientsRes] = await Promise.all([
                    axios.get(`${BASE_URL}/api/centres/combined-sales`, {
                        params: { centerId, year: new Date().getFullYear() },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${BASE_URL}/api/centres/combined-clients`, {
                        params: { centerId, year: new Date().getFullYear() },
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);
                
                setSalesData(salesRes.data || []);
                setClientsData(clientsRes.data || []);
            } catch (error) {
                console.error("Error fetching center data:", error.response?.data || error.message);
            }
        };
    
        fetchData();
    }, [centerId]);
    
    const getQuarterlyData = (data) => {
        const quarters = ["Q1", "Q2", "Q3", "Q4"];
        const quarterlySums = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    
        (data || []).forEach(({ month, value }) => {
            if (["January", "February", "March"].includes(month)) quarterlySums.Q1 += value;
            if (["April", "May", "June"].includes(month)) quarterlySums.Q2 += value;
            if (["July", "August", "September"].includes(month)) quarterlySums.Q3 += value;
            if (["October", "November", "December"].includes(month)) quarterlySums.Q4 += value;
        });
    
        return {
            labels: quarters,
            datasets: [
                {
                    label: "Quarterly Data",
                    data: Object.values(quarterlySums), // Ensures it returns [0,0,0,0] when no data
                    borderColor: "#6F5FE7",
                    backgroundColor: "rgba(111, 95, 231, 0.2)",
                    borderWidth: 2,
                    tension: 0.4,
                },
            ],
        };
    };
    
    
    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            tooltip: { enabled: true },
        },
        scales: {
            x: { grid: { color: "#444" }, ticks: { color: "#ccc" } },
            y: { grid: { color: "#444" }, ticks: { color: "#ccc" } },
        },
    };

    return (
        <div className="w-full py-5 min-h-screen h-auto bg-[#0D0D11] px-5 text-white">
            <h2 className="text-2xl font-bold mt-6 mb-5">Center Graph View</h2>

            <div className="flex gap-4 mb-5 justify-between items-center">
                <select
                    className="bg-[#1A1A1F] p-3 rounded-lg text-white"
                    value={centerId}
                    onChange={e => setCenterId(e.target.value)}>
                    <option value="">Select Center</option>
                    {centers.map(center => (
                        <option key={center._id} value={center._id}>{center.name}</option>
                    ))}
                </select>
            </div>
            <div className="w-full flex gap-6">
                <div className="bg-[#1A1A1F] p-6 rounded-lg shadow-lg w-1/2">
                    <h3 className="text-lg font-semibold mb-3">Sales Quarterly Graph</h3>
                    <Line data={getQuarterlyData(salesData)} options={options} />
                </div>
                <div className="bg-[#1A1A1F] p-6 rounded-lg shadow-lg w-1/2">
                    <h3 className="text-lg font-semibold mb-3">Clients Quarterly Graph</h3>
                    <Line data={getQuarterlyData(clientsData)} options={options} />
                </div>
            </div>
        </div>
    );
};

export default CenterGraph;