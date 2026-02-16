import React from "react";

const DataTable = ({ columns, data }) => {
  return (
    <div className="mt-10 text-white w-full overflow-x-auto rounded-xl border border-white/10 shadow-xl bg-[#1A1A1F]">
      <table className="w-full  border-white text-left">
        <thead>
          <tr className="bg-[#6F5FE7] text-white">
            {columns.map((col, index) => (
              <th key={index} className="p-4 text-center border-white">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} className="hover:bg-white/5 transition-colors border-gray-600">
              {columns.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className="p-4 text-center  border-white"
                >
                  {col.render ? col.render(row, rowIndex) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
