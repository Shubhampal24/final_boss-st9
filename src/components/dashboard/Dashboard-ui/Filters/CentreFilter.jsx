import { Listbox } from "@headlessui/react";


const CentreFilter = ({ selectedCentre, onCentreChange, centreOptions }) => {
    return (
        <div className="relative mb-4">
            <h3 className="mb-2 font-semibold">Center Filter</h3>
            <Listbox value={selectedCentre} onChange={onCentreChange}>
                <Listbox.Button className="py-2 px-4 min-w-44 bg-[#1A1A1F] text-left text-white border border-gray-600 rounded-lg">
                    {selectedCentre}
                </Listbox.Button>
                <Listbox.Options className="absolute min-w-44 bg-[#1A1A1F] mt-1 border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {centreOptions.map((centre, index) => (
                        <Listbox.Option
                            key={`${centre}-${index}`}
                            value={centre}
                            className={({ active }) =>
                                `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`}>
                            {centre}
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </Listbox>
        </div>
    );
};

export default CentreFilter;
