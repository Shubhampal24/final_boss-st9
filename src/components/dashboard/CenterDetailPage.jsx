import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { SlCalender } from "react-icons/sl";
import { HiCollection } from "react-icons/hi";
import CenterCollectionHistory from "./CenterCashCollectionHistory";
// import CenterDailyReportScreen from "../components/NewComponents/CenterDailyReport";
// import CenterExpenseScreen from "../components/NewComponents/CenterExpense";
// import CentreStaffListPage from "../components/NewComponents/test";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CustomInput = ({ value, onClick, placeholder }) => (
  <div className="relative h-full w-full">
    <input
      type="text"
      className="w-full p-3 rounded-lg h-auto border border-white bg-black text-white pr-10"
      value={value || ""}
      onClick={onClick}
      placeholder={value ? "" : placeholder}
      readOnly
    />
    <SlCalender
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white cursor-pointer"
      onClick={onClick}
    />
  </div>
);

const ExpandableSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="mb-4 border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1E1D1D] text-left p-4 flex justify-between items-center"
      >
        <span className="text-lg ">{title}</span>
        <span className="text-2xl">{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <div className="bg-[#131318] p-4">{children}</div>}
    </div>
  );
};

const CenterDetailPage = () => {
  const { id: centreId } = useParams();
  const navigate = useNavigate();

  // Centre Report state
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [errorReport, setErrorReport] = useState(null);

  // Cash Collection related states
  const [token, setToken] = React.useState(null);
  const [amount, setAmount] = React.useState("");
  const [remark, setRemark] = React.useState("");
  const [loadingCash, setLoadingCash] = React.useState(false);
  const [amountReceivingDate, setAmountReceivingDate] = React.useState(null);
  const [branchData, setBranchData] = React.useState({}); // You can fetch branchData if needed

  // Fetch center report data function (extracted for reuse)
  const fetchCenterReportData = () => {
    setLoadingReport(true);
    axios
      .get(`${BASE_URL}/api/centres/${centreId}/details`)
      .then((res) => {
        setReportData(res.data);
        setBranchData(res.data); // Use this to keep the balance and branch data
        setErrorReport(null);
        // console.log("Center Details Data:", res.data);
      })
      .catch((err) => setErrorReport(err.message || "Error loading report"))
      .finally(() => setLoadingReport(false));
  };

  // Fetch center report data on mount and when centreId changes
  useEffect(() => {
    fetchCenterReportData();
  }, [centreId]);

  // Fetch token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleConfirmCashCollection = async () => {
    if (!amount) {
      toast.error("Please enter amount.");
      return;
    }

    // Calculate total cash in centre by subtracting expenses - adjust as needed
    const totalCashInCentre = Math.max(
      0,
      (branchData.previousBalance || 0) +
      (branchData.balance || 0) -
      (branchData.totalExpenses || 0) -
      (branchData.todaysBalance || 0) +
      (branchData.todaysExpense || 0)
    );

    if (parseFloat(amount) > totalCashInCentre) {
      toast.error("Insufficient cash in centre to confirm this collection.");
      return;
    }

    const requestData = {
      centreId: centreId,
      regionId: branchData.regionId, // Use center's regionId if available or omit
      branchId: branchData.branchId, // Use center's branchId or omit
      amountReceived: amount,
      amountReceivingDate,
      remark,
    };

    try {
      setLoadingCash(true);
      await axios.post(`${BASE_URL}/api/cash-collection/cash-collection`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success("Cash collection confirmed!");
      setAmount("");
      setRemark("");
      setAmountReceivingDate(null);

      // Refresh data to update the page without navigation
      fetchCenterReportData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to record cash collection.");
    } finally {
      setLoadingCash(false);
    }
  };

  return (
    <div className="flex flex-col p-2 font-[Plus] w-full min-h-screen bg-[#131318] text-white">
      <div className="flex w-full h-auto items-center justify-between px-6 p-4">
        <button onClick={() => navigate(-1)} className="text-white mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="text-xl whitespace-nowrap">Center Details :&nbsp;{branchData?.name || ""}</div>
        <div style={{ width: 48 }}></div>
      </div>

      {/* <ExpandableSection title="Centre Report">
        {loadingReport && <div>Loading report...</div>}
        {errorReport && <div className="text-red-500">{errorReport}</div>}
        {reportData && (
          <pre className="whitespace-pre-wrap">{JSON.stringify(reportData, null, 2)}</pre>
        )}
      </ExpandableSection> */}
      {/* <ExpandableSection title="Daily Report">
        <div style={{ maxHeight: 550, overflowY: "auto" }}>
          <CenterDailyReportScreen centreId={centreId} />
        </div>
      </ExpandableSection> */}
      {/* <ExpandableSection title="Centre Staff List">
        <div style={{ maxHeight: 550, overflowY: "auto" }}>
          <CentreStaffListPage />
        </div>
      </ExpandableSection> */}
      {/* <ExpandableSection title="Expenses">
        <div style={{ maxHeight: 550, overflowY: "auto" }}>
          <CenterExpenseScreen selectedCentre={centreId} />
        </div>
      </ExpandableSection> */}

      <ExpandableSection title="Cash Collection">
        <div className="flex justify-between items-center">
          <span>Total Cash in Centre</span>
          <span className="text-[#6F5FE7]">
            {branchData.balance !== undefined &&
              branchData.previousBalance !== undefined &&
              branchData.totalExpenses !== undefined
              ? `Rs. ${(branchData.previousBalance || 0) +
              (branchData.balance || 0) -
              (branchData.totalExpenses || 0) -
              (branchData.todaysBalance || 0) +
              (branchData.todaysExpense || 0)
              }`
              : "N/A"}{" "}
            ▸
          </span>
        </div>
        <Toaster position="top-center" />
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Amount Received"
            className="w-full p-3 rounded-lg border border-white bg-black text-white"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div>
            <label className="block text-sm mb-1">Amount Receiving Date</label>
            <DatePicker
              selected={amountReceivingDate}
              onChange={setAmountReceivingDate}
              customInput={<CustomInput placeholder="Select Receiving Date" />}
              dateFormat="yyyy-MM-dd"
            />
          </div>
          <textarea
            placeholder="Remarks"
            className="w-full p-3 rounded-lg border border-white bg-black text-white"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
          <button
            onClick={handleConfirmCashCollection}
            disabled={loadingCash}
            className={`w-full bg-[#6F5FE7] text-white p-3 rounded-lg ${loadingCash ? "opacity-60 cursor-not-allowed" : ""
              }`}
          >
            {loadingCash ? "Confirming..." : "Confirm Collection"}
          </button>
        </div>
      </ExpandableSection>

      <ExpandableSection title="Cash Collection History">
        <div style={{ maxHeight: 550, overflowY: "auto" }}>
          <CenterCollectionHistory centreId={centreId} />
        </div>
      // </ExpandableSection>
    </div>
  );
};

export default CenterDetailPage;
