// NOT USING THIS COMPONENT --------------------------------------------------------> rm ./

import { useState } from "react";
import { Toaster } from "react-hot-toast";
import NavbarMain from "../NavbarMain";
import NavbarRouting from "./NavbarRouting";

import Blocks from "./Blocks";
import Customers from "./Customers";
import StaffAttendance from "./StaffAttendance";
// import Staff from "../staffList/Staff";
import OnlineCollection from "./OnlineCollection";
import CashCollection from "./CashCollection";
import TotalCollection from "./TotalCollection";
import ActiveMembers from "./ActiveMembers";
import Commision from "./Commision";
import CenterActive from "./CenterActive";
import CenterInactive from "./CenterInactive";
import CenterOtpLogin from "./CenterOtpLogin";
import DashBoardData from "./DashBoardData";

// ...existing imports...

const VisionHome = () => {
    const [selectedSection, setSelectedSection] = useState("dashboard");
    const [selectedTab, setSelectedTab] = useState("");

    const renderContent = () => {
        switch (selectedSection) {
            case "customers":
                return <Customers />;
            case "staff-attendance":
                return <StaffAttendance />;
            case "online-collection":
                return <OnlineCollection />;
            case "cash-collection":
                return <CashCollection />;
            case "total-collection":
                return <TotalCollection />;
            case "active-members":
                return <ActiveMembers />;
            case "commission":
                return <Commision />;
            case "center-active":
                return <CenterActive />;
            case "center-inactive":
                return <CenterInactive />;
            case "center-otp-login":
                return <CenterOtpLogin />;
            default:
                return (
                    <Blocks
                        setSelectedSection={setSelectedSection}
                        selectedTab={selectedTab}
                        setSelectedTab={setSelectedTab}
                    />
                );
        }
    };

    return (
        <div className="w-full py-5 min-h-screen h-auto bg-[#0D0D11] px-24">
            <Toaster position="top-center" reverseOrder={false} />
            <NavbarMain />
            <NavbarRouting
                setSelectedSection={setSelectedSection}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
            />
            {renderContent()}
            <DashBoardData />
        </div>
    );
};

export default VisionHome;