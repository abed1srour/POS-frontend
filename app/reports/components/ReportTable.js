"use client";

import React from "react";

// Icons
const Icon = {
  Package: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M16.466 7.5C15.643 4.237 13.952 2 12 2S8.357 4.237 7.534 7.5" />
      <path d="M2 3h20v14a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V3Z" />
      <path d="M7 14h.01" />
      <path d="M12 14h.01" />
      <path d="M17 14h.01" />
      <path d="M22 9v.01" />
    </svg>
  ),
  Users: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...p}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

export const ReportTable = ({ 
  title, 
  description, 
  data, 
  columns, 
  currentPage, 
  setCurrentPage, 
  itemsPerPage = 10,
  icon: IconComponent = Icon.Package,
  emptyMessage = "No data available",
  emptySubMessage = "Data will appear here once records are available"
}) => {
  const getPaginatedData = (data, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const getTotalPages = (data) => {
    return Math.ceil(data.length / itemsPerPage);
  };

  const totalPages = getTotalPages(data);
  const paginatedData = getPaginatedData(data, currentPage);

  return (
    <div className="rounded-3xl border border-gray-200/60 bg-white/90 shadow-xl dark:border-white/10 dark:bg-white/5 backdrop-blur-sm overflow-hidden relative z-10">
      <div className="p-6 border-b border-gray-200/60 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/20">
            <IconComponent className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {data.length} {data.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-base">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10 text-sm text-gray-600 dark:text-gray-300">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-4 text-center font-bold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/60 dark:divide-white/10">
            {data.length > 0 ? (
              paginatedData.map((item, index) => {
                const globalIndex = (currentPage - 1) * itemsPerPage + index;
                return (
                  <tr key={globalIndex} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors duration-200">
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 text-center">
                        {column.render ? column.render(item, globalIndex) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {item[column.key]}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <IconComponent className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                      {emptyMessage}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                      {emptySubMessage}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {data.length > itemsPerPage && (
        <div className="p-6 border-t border-gray-200/60 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, data.length)} of {data.length} items
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

