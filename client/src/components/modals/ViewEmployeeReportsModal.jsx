import React, { useState, useEffect } from "react";
import axios from "../../config/api";
import toast from "react-hot-toast";
import { AiOutlineClose } from "react-icons/ai";
import { FiCalendar, FiMapPin, FiPackage, FiClock, FiChevronDown, FiChevronUp, FiDownload } from "react-icons/fi";
import * as XLSX from 'xlsx';

const ViewEmployeeReportsModal = ({ isOpen, onClose, employee }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  useEffect(() => {
    if (isOpen && employee) {
      fetchEmployeeReports();
    }
  }, [isOpen, employee]);

  const fetchEmployeeReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/daily-calls", {
        withCredentials: true,
      });
      // Filter reports for this specific employee
      const employeeReports = res.data.filter(
        (call) => call.mr?._id === employee._id
      );
      setReports(employeeReports);
    } catch (err) {
      console.error("Error fetching employee reports:", err);
      toast.error("Failed to fetch reports");
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <FiChevronUp size={14} className="inline ml-1" />
    ) : (
      <FiChevronDown size={14} className="inline ml-1" />
    );
  };

  const handleClearFilters = () => {
    setDateFilter({ startDate: "", endDate: "" });
    setSearch("");
  };

  const filteredAndSortedReports = reports
    .filter((report) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        report.doctor?.name?.toLowerCase().includes(searchLower) ||
        report.doctor?.city?.toLowerCase().includes(searchLower) ||
        report.doctor?.clinicName?.toLowerCase().includes(searchLower) ||
        report.remarks?.toLowerCase().includes(searchLower);

      // Date filtering
      let matchesDate = true;
      if (dateFilter.startDate || dateFilter.endDate) {
        const callDate = new Date(report.date);
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
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case "date":
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case "doctor":
          aValue = a.doctor?.name?.toLowerCase() || "";
          bValue = b.doctor?.name?.toLowerCase() || "";
          break;
        case "city":
          aValue = a.doctor?.city?.toLowerCase() || "";
          bValue = b.doctor?.city?.toLowerCase() || "";
          break;
        case "submitted":
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredAndSortedReports.map((report) => ({
        'Visit Date': formatDate(report.date),
        'Doctor Name': `Dr. ${report.doctor?.name || 'N/A'}`,
        'Clinic Name': report.doctor?.clinicName || '-',
        'City': report.doctor?.city || '-',
        'Products': report.products && report.products.length > 0
          ? report.products.map(p => p.productName || p.name).join(', ')
          : '-',
        'Remarks': report.remarks || '-',
        'Submitted On': formatDateTime(report.createdAt),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const colWidths = [
        { wch: 15 }, // Visit Date
        { wch: 25 }, // Doctor Name
        { wch: 25 }, // Clinic Name
        { wch: 15 }, // City
        { wch: 40 }, // Products
        { wch: 40 }, // Remarks
        { wch: 20 }, // Submitted On
      ];
      ws['!cols'] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `${employee?.name || 'Employee'} Reports`);

      // Generate file name
      const fileName = `${employee?.name || 'Employee'}_Reports_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);
      
      toast.success(`Exported ${filteredAndSortedReports.length} reports to Excel`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export data');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-4 px-4 sm:py-8">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-start sm:items-center">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 truncate">
              Reports - {employee?.name}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {filteredAndSortedReports.length} of {reports.length} reports
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={exportToExcel}
              disabled={filteredAndSortedReports.length === 0}
              className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to Excel"
            >
              <FiDownload size={20} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 -mr-2 touch-manipulation flex-shrink-0"
            >
              <AiOutlineClose size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-b bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
                className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 touch-manipulation"
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
                className="w-full border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 touch-manipulation"
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
                  className="flex-1 border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 touch-manipulation min-w-0"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {(dateFilter.startDate || dateFilter.endDate || search) && (
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 active:bg-gray-700 transition-colors whitespace-nowrap touch-manipulation"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          {(dateFilter.startDate || dateFilter.endDate) && (
            <div className="flex items-center text-xs text-cyan-600 mt-2">
              <FiCalendar className="inline mr-1" size={12} />
              Date filter active
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          ) : filteredAndSortedReports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiCalendar size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">{reports.length === 0 ? "No daily call reports found for this employee" : "No reports match your search"}</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden p-3 space-y-3">
                {filteredAndSortedReports.map((report) => (
                  <div key={report._id} className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
                    {/* Header with dates */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <FiCalendar className="mr-1" size={12} />
                        {formatDate(report.date)}
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <FiClock size={10} className="mr-1" />
                        {formatDateTime(report.createdAt).split(',')[0]}
                      </div>
                    </div>

                    {/* Doctor Name - Prominent */}
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                      Dr. {report.doctor?.name || "N/A"}
                    </div>

                    {/* Clinic and Location */}
                    {(report.doctor?.clinicName || report.doctor?.city) && (
                      <div className="text-xs text-gray-600 mb-2">
                        {report.doctor?.clinicName && (
                          <div className="font-medium">{report.doctor.clinicName}</div>
                        )}
                        {report.doctor?.city && (
                          <div className="flex items-center text-gray-500 mt-0.5">
                            <FiMapPin size={10} className="mr-1" />
                            {report.doctor.place || report.doctor.city}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Products */}
                    {report.products && report.products.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-medium text-gray-700 mb-1">Products:</div>
                        <div className="flex flex-wrap gap-1">
                          {report.products.slice(0, 3).map((product) => (
                            <span
                              key={product._id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-cyan-50 text-cyan-700 border border-cyan-200"
                            >
                              <FiPackage size={10} className="mr-0.5" />
                              {product.productName || product.name}
                            </span>
                          ))}
                          {report.products.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                              +{report.products.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Remarks */}
                    {report.remarks && (
                      <div className="text-xs text-gray-600 border-t pt-2">
                        <span className="font-medium">Remarks:</span> {report.remarks}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("date")}
                    >
                      Visit Date {getSortIcon("date")}
                    </th>
                    <th
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("doctor")}
                    >
                      Doctor {getSortIcon("doctor")}
                    </th>
                    <th
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("city")}
                    >
                      Location {getSortIcon("city")}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("submitted")}
                    >
                      Submitted {getSortIcon("submitted")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-xs text-gray-900 font-medium">
                          <FiCalendar className="mr-1.5 text-gray-400" size={14} />
                          {formatDate(report.date)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-semibold text-gray-900">
                          Dr. {report.doctor?.name || "N/A"}
                        </div>
                        {report.doctor?.clinicName && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {report.doctor.clinicName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600">
                          {(report.doctor?.place || report.doctor?.city) ? (
                            <div className="flex items-center">
                              <FiMapPin size={10} className="mr-1" />
                              {report.doctor.place || report.doctor.city}
                            </div>
                          ) : (
                            "-"
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {report.products && report.products.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {report.products.slice(0, 2).map((product) => (
                              <span
                                key={product._id}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-cyan-50 text-cyan-700 border border-cyan-200"
                              >
                                <FiPackage size={10} className="mr-0.5" />
                                {product.productName || product.name}
                              </span>
                            ))}
                            {report.products.length > 2 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                                +{report.products.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-600 max-w-xs truncate" title={report.remarks}>
                          {report.remarks || "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center text-xs text-gray-500">
                          <FiClock size={10} className="mr-1" />
                          {formatDateTime(report.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

        <div className="border-t px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 active:bg-gray-800 transition-colors text-sm sm:text-base touch-manipulation"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeReportsModal;
