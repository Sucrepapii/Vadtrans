import React from "react";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSpinner,
  FaInbox,
} from "react-icons/fa";

const Table = ({
  columns,
  data,
  onSort,
  sortColumn,
  sortDirection,
  loading = false,
  emptyMessage = "No data available",
}) => {
  const handleSort = (column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  const getSortIcon = (column) => {
    if (!column.sortable) return null;
    if (sortColumn !== column.key)
      return <FaSort className="text-neutral-400" />;
    return sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="text-4xl text-primary animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-neutral-500">
        <FaInbox className="text-6xl mb-4 text-neutral-300" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-sm font-semibold text-neutral-700 ${
                  column.sortable ? "cursor-pointer hover:bg-neutral-100" : ""
                }`}
                onClick={() => handleSort(column)}>
                <div className="flex items-center gap-2">
                  {column.label}
                  {getSortIcon(column)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className="hover:bg-neutral-50 transition-colors">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 text-sm">
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
