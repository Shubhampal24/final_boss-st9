import React from "react";

const DataTable = ({ columns, data }) => {
  return (
    <div className="mt-10 text-white px-4">
      <table className="w-full border border-white text-left">
        <thead>
          <tr className="bg-[#6F5FE7] text-white">
            {columns.map((col, index) => (
              <th key={index} className="p-4 text-center border border-white">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row._id || rowIndex} className="border border-gray-600">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="p-4 text-center border border-white">
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
