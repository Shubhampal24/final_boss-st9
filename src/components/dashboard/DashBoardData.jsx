import { Toaster } from 'react-hot-toast'
import NavbarMain from '../NavbarMain'
import NavbarRouting from './NavbarRouting'
import TotalRevenue from './Dashboard-ui/TotalRevenue'
import MonthlyOverviewGraph from './Dashboard-ui/MonthlyOverviewGraph'
import OverviewTable from './Dashboard-ui/OverviewTable'
import React, { useState } from 'react'
import Blocks from './Blocks' // <-- Import your new Blocks component
// import CashCollectionScreen from './Dashboard-ui/CashCollectionScreen'
function DashBoardData() {
    // Add state for selectedSection and selectedTab
    const [selectedSection, setSelectedSection] = useState(null)
    const [selectedTab, setSelectedTab] = useState('all') // Default tab, adjust as needed

    return (
        <div className="w-full py-5 min-h-screen h-auto bg-[#0D0D11] px-24 text-white">
            <Toaster position="top-center" reverseOrder={false} />
            {/* <NavbarMain /> */}
            {/* <NavbarRouting /> */}
            {/* Add Blocks component here */}
            {/* <Blocks
                setSelectedSection={setSelectedSection}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
            /> */}
            <TotalRevenue />
            <MonthlyOverviewGraph />
            {/* <OverviewTable /> */}
            {/* <CashCollectionScreen /> */}
            
        </div>
    )
}

export default DashBoardData