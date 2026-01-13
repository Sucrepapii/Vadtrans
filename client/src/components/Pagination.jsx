import React from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  totalItems,
  onItemsPerPageChange,
}) => {
  const maxVisiblePages = 5;
  const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-neutral-200">
      {/* Items info */}
      <div className="text-sm text-neutral-600">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <FaAngleDoubleLeft />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <FaChevronLeft />
        </button>

        {/* Page numbers */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[2.5rem] px-3 py-1 rounded ${
              currentPage === page
                ? "bg-primary text-white"
                : "hover:bg-neutral-100 text-neutral-700"
            } transition-colors`}>
            {page}
          </button>
        ))}

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <FaChevronRight />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <FaAngleDoubleRight />
        </button>
      </div>

      {/* Items per page */}
      {onItemsPerPageChange && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-600">Show:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="border border-neutral-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default Pagination;
