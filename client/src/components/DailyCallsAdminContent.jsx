import React, { useState, useEffect } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import { FiCalendar, FiUser, FiMapPin, FiPackage, FiClock, FiDownload } from "react-icons/fi";
import * as XLSX from 'xlsx';

const DailyCallsAdminContent = () => {
  const [dailyCalls, setDailyCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });

  const fetchDailyCalls = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/daily-calls", {
        withCredentials: true,
      });
      setDailyCalls(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching daily calls:", err);
      toast.error("Failed to fetch daily calls");
      setDailyCalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyCalls();
  }, []);

  const filteredCalls = dailyCalls.filter((call) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      call.mr?.name?.toLowerCase().includes(searchLower) ||
      call.doctor?.name?.toLowerCase().includes(searchLower) ||
      call.doctor?.clinicName?.toLowerCase().includes(searchLower) ||
      call.doctor?.place?.toLowerCase().includes(searchLower) ||
      call.doctor?.city?.toLowerCase().includes(searchLower) ||
      call.doctor?.area?.toLowerCase().includes(searchLower) ||
      call.remarks?.toLowerCase().includes(searchLower);

    // Date filtering
    let matchesDate = true;
    if (dateFilter.startDate || dateFilter.endDate) {
      const callDate = new Date(call.date);
      callDate.setHours(0, 0, 0, 0);

      if (dateFilter.startDate) {
        const startDate = new Date(dateFilter.startDate);
        startDate.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && callDate >= startDate;
      }

      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && callDate <= endDate;
      }
    }

    return matchesSearch && matchesDate;
  });

  const handleClearFilters = () => {
    setDateFilter({ startDate: "", endDate: "" });
    setSearch("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredCalls.map((call) => ({
        'Visit Date': formatDate(call.date),
        'MR Name': call.mr?.name || 'N/A',
        'Doctor Name': `Dr. ${call.doctor?.name || 'N/A'}`,
        'Clinic Name': call.doctor?.clinicName || '-',
        'Place': call.doctor?.place || call.doctor?.city || '-',
        'Area': call.doctor?.area || '-',
        'Products': call.products && call.products.length > 0
          ? call.products.map(p => p.productName || p.name).join(', ')
          : '-',
        'Remarks': call.remarks || '-',
        'Submitted On': formatDateTime(call.createdAt),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const colWidths = [
        { wch: 15 }, // Visit Date
        { wch: 20 }, // MR Name
        { wch: 25 }, // Doctor Name
        { wch: 25 }, // Clinic Name
        { wch: 15 }, // Place
        { wch: 20 }, // Area
        { wch: 40 }, // Products
        { wch: 40 }, // Remarks
        { wch: 20 }, // Submitted On
      ];
      ws['!cols'] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Daily Call Reports');

      // Generate file name with current date
      const fileName = `Daily_Call_Reports_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);
      
      toast.success(`Exported ${filteredCalls.length} reports to Excel`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
        Daily Call Reports
      </h2>
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
        {/* Filters Section */}
        <div className="mb-4 sm:mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Date Range Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) =>
                  setDateFilter((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 touch-manipulation"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) =>
                  setDateFilter((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 touch-manipulation"
              />
            </div>

            {/* Search Box */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="flex gap-2">
                <input
                  type="search"
                  placeholder="Search..."
                  className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 touch-manipulation min-w-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {(dateFilter.startDate || dateFilter.endDate || search) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-3 sm:px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 active:bg-gray-700 transition-colors whitespace-nowrap touch-manipulation"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={exportToExcel}
                  disabled={filteredCalls.length === 0}
                  className="px-3 sm:px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 active:bg-green-800 transition-colors whitespace-nowrap touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  title="Export to Excel"
                >
                  <FiDownload size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t">
            <span>
              Showing <span className="font-semibold">{filteredCalls.length}</span> of{" "}
              <span className="font-semibold">{dailyCalls.length}</span> reports
            </span>
            {(dateFilter.startDate || dateFilter.endDate) && (
              <span className="text-cyan-600">
                <FiCalendar className="inline mr-1" size={12} />
                Date filter active
              </span>
            )}
          </div>
        </div>

        {filteredCalls.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiCalendar size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-base">No daily call reports found</p>
          </div>
        ) : (
          <div className="max-h-[65vh] overflow-y-auto pr-1">
            <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredCalls.map((call) => (
                <div key={call._id} className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <FiCalendar className="mr-1" size={12} />
                      {formatDate(call.date)}
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                      <FiClock className="mr-1" size={10} />
                      {formatDateTime(call.createdAt).split(',')[0]}
                    </div>
                  </div>
                  
                  {/* Doctor Name */}
                  <div className="font-semibold text-gray-900 text-sm mb-1">
                    Dr. {call.doctor?.name || "N/A"}
                  </div>
                  
                  {/* MR Name */}
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <FiUser className="mr-1" size={10} />
                    MR: {call.mr?.name || "N/A"}
                  </div>
                  
                  {/* Location */}
                  {(call.doctor?.clinicName || call.doctor?.place || call.doctor?.city || call.doctor?.area) && (
                    <div className="text-xs text-gray-600 mb-2">
                      <div className="flex items-center text-gray-500">
                        <FiMapPin size={10} className="mr-1" />
                        {call.doctor?.clinicName && <span>{call.doctor.clinicName}</span>}
                        {call.doctor?.clinicName && (call.doctor?.place || call.doctor?.city) && <span> • </span>}
                        {(call.doctor?.place || call.doctor?.city) && <span>{call.doctor.place || call.doctor.city}</span>}
                        {call.doctor?.area && (call.doctor?.place || call.doctor?.city) && <span> • </span>}
                        {call.doctor?.area && <span>{call.doctor.area}</span>}
                      </div>
                    </div>
                  )}
                  
                  {/* Products */}
                  {call.products && call.products.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs font-medium text-gray-700 mb-1">Products:</div>
                      <div className="flex flex-wrap gap-1">
                        {call.products.slice(0, 3).map((product) => (
                          <span
                            key={product._id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-cyan-50 text-cyan-700 border border-cyan-200"
                          >
                            <FiPackage size={10} className="mr-0.5" />
                            {product.productName || product.name}
                          </span>
                        ))}
                        {call.products.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                            +{call.products.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Remarks */}
                  {call.remarks && (
                    <div className="text-xs text-gray-600 border-t pt-2">
                      <span className="font-medium">Remarks:</span> {call.remarks}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visit Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MR / Doctor
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCalls.map((call) => (
                  <tr key={call._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center text-xs text-gray-900 font-medium">
                        <FiCalendar className="mr-1.5 text-gray-400" size={14} />
                        {formatDate(call.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <div className="font-semibold text-gray-900 flex items-center">
                          Dr. {call.doctor?.name || "N/A"}
                        </div>
                        <div className="text-gray-500 mt-0.5 flex items-center">
                          <FiUser className="mr-1" size={10} />
                          MR: {call.mr?.name || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600">
                        {(call.doctor?.clinicName || call.doctor?.place || call.doctor?.city || call.doctor?.area) ? (
                          <div className="flex items-center text-gray-500">
                            <FiMapPin size={10} className="mr-1" />
                            {call.doctor?.clinicName && <span>{call.doctor.clinicName}</span>}
                            {call.doctor?.clinicName && (call.doctor?.place || call.doctor?.city) && <span> • </span>}
                            {(call.doctor?.place || call.doctor?.city) && <span>{call.doctor.place || call.doctor.city}</span>}
                            {call.doctor?.area && (call.doctor?.place || call.doctor?.city) && <span> • </span>}
                            {call.doctor?.area && <span>{call.doctor.area}</span>}
                          </div>
                        ) : (
                          "-"
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {call.products && call.products.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {call.products.slice(0, 2).map((product) => (
                            <span
                              key={product._id}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-cyan-50 text-cyan-700 border border-cyan-200"
                            >
                              <FiPackage size={10} className="mr-0.5" />
                              {product.productName || product.name}
                            </span>
                          ))}
                          {call.products.length > 2 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                              +{call.products.length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600 max-w-xs truncate" title={call.remarks}>
                        {call.remarks || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        {formatDateTime(call.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyCallsAdminContent;
