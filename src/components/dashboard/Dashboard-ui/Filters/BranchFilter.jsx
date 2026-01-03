import { Listbox } from "@headlessui/react";

const BranchFilter = ({ selectedBranch, onBranchChange, branchOptions }) => {
    return (
        <div className="relative mb-4">
            <h3 className="mb-2 font-semibold">Branch Filter</h3>
            <Listbox value={selectedBranch} onChange={onBranchChange}>
                <Listbox.Button className="py-2 px-4 min-w-44 bg-[#1A1A1F] text-left text-white border border-gray-600 rounded-lg">
                    {selectedBranch}
                </Listbox.Button>
                <Listbox.Options className="absolute min-w-44 bg-[#1A1A1F] mt-1 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {branchOptions.map((branch, index) => (
                        <Listbox.Option
                            key={`${branch}-${index}`}
                            value={branch}
                            className={({ active }) =>
                                `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`}>
                            {branch}
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </Listbox>
        </div>
    );
};

export default BranchFilter;
