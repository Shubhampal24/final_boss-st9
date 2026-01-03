import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import Login from "./components/dashboard/Login";
import Desktop from "./components/Desktop";
import DashBoardData from "./components/dashboard/DashBoardData";
import RegionWiseAnalysis from "./components/Region Wise/RegionWiseAnalysis";
import BranchWiseAnalysis from "./components/Branch Wise/BranchWiseAnalysis";
import BranchGraph from "./components/Branch Wise/BranchGraph";
import CentreWiseAnalysis from "./components/Centre Wise/CentreWiseAnalysis";
import CenterGraph from "./components/Centre Wise/CenterGraph";
import Complaints from "./components/Complaints/Complaints";
import TicTacToe from "./components/games/TicTac";
import DailySummary from "./components/Summary Data/Summary";
import Customers from "./components/dashboard/Customers";
import VisionHome from "./components/dashboard/VisionHome";
import Staff from "./components/staffList/Staff";
import CashCollectionScreen from "./components/dashboard/CashCollectionScreen";
import CenterReport from "./components/Center Report/CenterReport";

import CashInhand from "./components/Cash Handover/CashInhand";
import CashCollectionHistory from "./components/Cash Handover/CashHandoverHistory";
import CashSubmissions from "./components/Cash History/AllCashHistory";
import RegionGraph from "./components/Region Wise/RegionGraph";
import ArmUserTable from "./components/Area Manager List/AmList";
import ArmUserDetail from "./components/Area Manager List/ArmUserDetail";
import ExpencesReport from "./components/Expenses/Expences";
import CenterDetailPage from "./components/dashboard/CenterDetailPage";

function App() {
  const ProtectedRoute = ({ element }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in first!");
      return <Navigate to="/login" replace />;
    }

    return element;
  };
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Desktop />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tictactoe" element={<TicTacToe />} />
        <Route path="/cash-collection" element={<ProtectedRoute element={<CashCollectionScreen />} />} />
        <Route path="/cash-in-hand" element={<CashInhand />} />
        <Route path="/cash-handover-history" element={<CashCollectionHistory />} />
        <Route path="/all-handover-history" element={<CashSubmissions />} />
        <Route path="/center-report" element={<ProtectedRoute element={<CenterReport />} />} />
        <Route path="/dashboard" element={<ProtectedRoute element={
          <>
            {/* <DashBoardData /> */}
            <VisionHome />
          </>
        } />} />
        <Route path="/dashboard/staff-list" element={<ProtectedRoute element={<Staff />} />} />

        <Route path="/summary" element={<ProtectedRoute element={<DailySummary />} />} />
        <Route path="/arm-user-list" element={<ProtectedRoute element={<ArmUserTable />} />} />
        <Route path="/arm-users/:id" element={<ProtectedRoute element={<ArmUserDetail />} />} />

        {/* Region Wise Path */}
        <Route path="/region-data" element={<ProtectedRoute element={<RegionWiseAnalysis />} />} />
        <Route path="/region-graph" element={<ProtectedRoute element={<RegionGraph />} />} />

        {/* Branch Wise */}
        <Route path="/branch-data" element={<ProtectedRoute element={<BranchWiseAnalysis />} />} />

        {/* Centre Wise */}
        <Route path="/centre-data" element={<ProtectedRoute element={<CentreWiseAnalysis />} />} />

        <Route path="/complaints" element={<ProtectedRoute element={<Complaints />} />} />
        <Route path="/customer-data" element={<ProtectedRoute element={<Customers />} />} />
        <Route path="/expenses-report" element={<ProtectedRoute element={<ExpencesReport />} />} />
        <Route path="/center-details/:id" element={<CenterDetailPage/>}/>
        
      </Routes>
    </Router>
  );
};
export default App;
