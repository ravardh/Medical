import React, { useState, useEffect } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import { FiPlus, FiDownload, FiTrash2, FiFileText } from "react-icons/fi";
import AddSalarySlipModal from "./modals/AddSalarySlipModal";

const SalarySlipContent = () => {
  const [salarySlips, setSalarySlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  useEffect(() => {
    fetchSalarySlips();
  }, []);

  const fetchSalarySlips = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/admin/salary-slips", {
        withCredentials: true,
      });
      setSalarySlips(response.data);
    } catch (error) {
      console.error("Error fetching salary slips:", error);
      toast.error("Failed to fetch salary slips", {
        duration: 4000,
        position: 'top-center'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id, employeeName, month, year) => {
    try {
      const response = await axios.get(`/admin/salary-slips/${id}/pdf`, {
        responseType: "blob",
        withCredentials: true,
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `salary_slip_${employeeName}_${month}_${year}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Salary slip downloaded successfully", {
        duration: 3000,
        position: 'top-center'
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF", {
        duration: 4000,
        position: 'top-center'
      });
    }
  };

  const handleDelete = (id, employeeName, month, year) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="font-semibold text-gray-900">Confirm Deletion</div>
        <div className="text-sm text-gray-600">
          Are you sure you want to delete the salary slip for{" "}
          <span className="font-semibold">{employeeName}</span> ({month} {year})?
        </div>
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
          ⚠️ This action cannot be undone.
        </div>
        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.delete(`/admin/salary-slips/${id}`, {
                  withCredentials: true,
                });
                toast.success("Salary slip deleted successfully", {
                  duration: 3000,
                  position: 'top-center'
                });
                fetchSalarySlips();
              } catch (error) {
                console.error("Error deleting salary slip:", error);
                toast.error(
                  error.response?.data?.message || "Failed to delete salary slip",
                  {
                    duration: 4000,
                    position: 'top-center'
                  }
                );
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
    });
  };

  const handleSlipCreated = () => {
    fetchSalarySlips();
    setIsModalOpen(false);
  };

  // Filter salary slips
  const filteredSlips = salarySlips.filter((slip) => {
    const matchesSearch = slip.employeeName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth ? slip.month === filterMonth : true;
    const matchesYear = filterYear
      ? slip.year === parseInt(filterYear)
      : true;
    return matchesSearch && matchesMonth && matchesYear;
  });

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3 md:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Salary Slips</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            Generate and manage employee salary slips
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 sm:py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <FiPlus size={20} />
          <span className="text-sm sm:text-base">Generate Slip</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 md:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Search Employee
            </label>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Month
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm"
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Year
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm"
            >
              <option value="">All Years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Salary Slips Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredSlips.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FiFileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-base sm:text-lg">No salary slips found</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">
              Click "Generate Slip" to create one
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile & Tablet Card View */}
            <div className="md:hidden space-y-3 p-3">
              {filteredSlips.map((slip) => (
                <div key={slip._id} className="rounded-xl p-4 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-base truncate">{slip.employeeName}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{slip.employeeEmail}</p>
                    </div>
                    <div className="ml-3 flex-shrink-0 bg-green-100 px-3 py-1.5 rounded-lg">
                      <p className="text-sm font-bold text-green-700">₹{slip.netSalary.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 bg-gray-100 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">Period:</span>
                      <span className="text-gray-900 font-semibold">{slip.month} {slip.year}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">Designation:</span>
                      <span className="text-gray-900 font-semibold truncate ml-2">{slip.designation}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">Payment Date:</span>
                      <span className="text-gray-900 font-semibold">{new Date(slip.paymentDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadPDF(slip._id, slip.employeeName, slip.month, slip.year)}
                      className="flex-1 flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 shadow-md"
                    >
                      <FiDownload size={16} /> Download
                    </button>
                    <button
                      onClick={() => handleDelete(slip._id, slip.employeeName, slip.month, slip.year)}
                      className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-700 py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors duration-200"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden md:table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Name
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month/Year
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Salary
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSlips.map((slip) => (
                  <tr
                    key={slip._id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {slip.employeeName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {slip.employeeEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {slip.designation}
                      </div>
                      <div className="text-sm text-gray-500">
                        {slip.department}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {slip.month} {slip.year}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        ₹ {slip.netSalary.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Total: ₹ {slip.totalEarnings.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(slip.paymentDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleDownloadPDF(
                              slip._id,
                              slip.employeeName,
                              slip.month,
                              slip.year
                            )
                          }
                          className="text-cyan-600 hover:text-cyan-900 p-2 hover:bg-cyan-50 rounded-lg transition-colors duration-200"
                          title="Download PDF"
                        >
                          <FiDownload size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(slip._id, slip.employeeName, slip.month, slip.year)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Salary Slip Modal */}
      {isModalOpen && (
        <AddSalarySlipModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSlipCreated={handleSlipCreated}
        />
      )}
    </div>
  );
};

export default SalarySlipContent;
