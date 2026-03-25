import React, { useState, useEffect } from "react";
import axios from "../../config/api";
import { FiX, FiUser, FiDollarSign, FiCalendar } from "react-icons/fi";

const AddSalarySlipModal = ({ isOpen, onClose, onSlipCreated }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    employeeName: "",
    employeeEmail: "",
    designation: "",
    department: "Sales",
    month: "",
    year: new Date().getFullYear(),
    paymentDate: new Date().toISOString().split("T")[0],
    earnings: {
      basicSalary: "",
      houseRentAllowance: "",
      conveyanceAllowance: "",
      medicalAllowance: "",
      specialAllowance: "",
      otherAllowance: "",
    },
    deductions: {
      providentFund: "",
      professionalTax: "",
      incomeTax: "",
      loan: "",
      otherDeductions: "",
    },
    paymentMethod: "Bank Transfer",
    transferId: "",
    bankDetails: {
      bankName: "",
      accountNumber: "",
    },
    upiId: "",
    remarks: "",
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
  const currentMonth = new Date().getMonth(); // 0-11 (January = 0, December = 11)
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Get available months based on selected year
  const getAvailableMonths = () => {
    if (formData.year === currentYear) {
      // For current year, only show months up to current month
      return months.slice(0, currentMonth + 1);
    }
    // For past years, show all months
    return months;
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      setIsFormDirty(false); // Reset dirty state when modal opens
    }
  }, [isOpen]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormDirty && isOpen) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    const handlePopState = (e) => {
      if (isFormDirty && isOpen) {
        const confirmed = window.confirm(
          "You have unsaved changes. All data will be lost if you go back. Are you sure you want to leave?"
        );
        if (!confirmed) {
          // Push the current state back to prevent navigation
          window.history.pushState(null, "", window.location.href);
        } else {
          setIsFormDirty(false);
        }
      }
    };

    if (isOpen && isFormDirty) {
      // Push a dummy state to enable popstate detection
      window.history.pushState(null, "", window.location.href);
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isFormDirty, isOpen]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/admin/salary-slips/employees", {
        withCredentials: true,
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees", {
        position: 'top-center',
        duration: 4000,
        style: {
          maxWidth: '90vw',
          background: '#ef4444',
          color: 'white',
        },
      });
    }
  };

  const handleEmployeeChange = (e) => {
    const employeeId = e.target.value;
    const selectedEmployee = employees.find((emp) => emp._id === employeeId);

    if (selectedEmployee) {
      setIsFormDirty(true);
      setFormData((prev) => ({
        ...prev,
        employeeId: selectedEmployee._id,
        employeeName: selectedEmployee.name,
        employeeEmail: selectedEmployee.email,
      }));
    }
  };

  const handleEarningChange = (field, value) => {
    setIsFormDirty(true);
    setFormData((prev) => ({
      ...prev,
      earnings: {
        ...prev.earnings,
        [field]: value,
      },
    }));
  };

  const handleDeductionChange = (field, value) => {
    setIsFormDirty(true);
    setFormData((prev) => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [field]: value,
      },
    }));
  };

  const handleBankDetailsChange = (field, value) => {
    setIsFormDirty(true);
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value,
      },
    }));
  };

  const calculateTotalEarnings = () => {
    return Object.values(formData.earnings).reduce(
      (sum, val) => sum + Number(val),
      0
    );
  };

  const calculateTotalDeductions = () => {
    return Object.values(formData.deductions).reduce(
      (sum, val) => sum + Number(val),
      0
    );
  };

  const calculateNetSalary = () => {
    return calculateTotalEarnings() - calculateTotalDeductions();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeId) {
      alert("Please select an employee");
      return;
    }

    if (!formData.designation) {
      alert("Please enter designation");
      return;
    }

    if (!formData.month) {
      alert("Please select a month");
      return;
    }

    if (!formData.earnings.basicSalary || parseFloat(formData.earnings.basicSalary) <= 0) {
      alert("Please enter a valid basic salary");
      return;
    }

    if (!formData.transferId) {
      alert("Please enter Transfer ID");
      return;
    }

    if (formData.paymentMethod === "UPI" && !formData.upiId) {
      alert("Please enter UPI ID for UPI payment");
      return;
    }

    // Convert empty strings to 0 before submitting
    const submissionData = {
      ...formData,
      earnings: Object.fromEntries(
        Object.entries(formData.earnings).map(([key, value]) => [
          key,
          value === "" ? 0 : parseFloat(value) || 0,
        ])
      ),
      deductions: Object.fromEntries(
        Object.entries(formData.deductions).map(([key, value]) => [
          key,
          value === "" ? 0 : parseFloat(value) || 0,
        ])
      ),
    };

    console.log("Submitting salary slip data:", submissionData);

    try {
      setLoading(true);
      await axios.post("/admin/salary-slips", submissionData, {
        withCredentials: true,
      });
      alert("Salary slip created successfully!");
      setIsFormDirty(false); // Reset dirty state after successful submission
      onSlipCreated();
    } catch (error) {
      console.error("Error creating salary slip:", error);
      alert(error.response?.data?.message || "Failed to create salary slip");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (isFormDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. All data will be lost if you close now. Are you sure you want to close?"
      );
      if (confirmed) {
        setIsFormDirty(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-4 px-3 sm:px-4">
      <div className="bg-white rounded-lg w-full sm:max-w-4xl max-h-[calc(100vh-5rem-2rem)] sm:max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-5 sm:px-6 py-3.5 sm:py-4 flex justify-between items-center rounded-t-lg">
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Generate Salary Slip
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">
              Fill in employee details and salary information
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 ml-4"
            title="Close"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* Employee Information */}
          <div className="bg-cyan-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-cyan-100">
            <div className="flex items-center gap-2 mb-3">
              <FiUser size={16} className="text-cyan-600" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                Employee Information
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee *
                </label>
                <select
                  value={formData.employeeId}
                  onChange={handleEmployeeChange}
                  className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white shadow-sm"
                  required
                >
                  <option value="">Choose an employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation *
                </label>
                <select
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                  className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white shadow-sm"
                  required
                >
                  <option value="">Select Designation</option>
                  <option value="Medical Representative">Medical Representative</option>
                  <option value="Marketing Manager">Marketing Manager</option>
                  <option value="Sales Executive">Sales Executive</option>
                  <option value="HR">HR</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white shadow-sm"
                >
                  <option value="">Select Department</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Accounts">Accounts</option>
                </select>
              </div>
            </div>
          </div>

          {/* Period Information */}
          <div className="bg-purple-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <FiCalendar size={16} className="text-purple-600" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                Period & Payment
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month *
                </label>
                <select
                  value={formData.month}
                  onChange={(e) =>
                    setFormData({ ...formData, month: e.target.value })
                  }
                  className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
                  required
                >
                  <option value="">Select Month</option>
                  {getAvailableMonths().map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <select
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
                  required
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentDate: e.target.value })
                  }
                  className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Earnings and Deductions Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {/* Earnings */}
            <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-100">
              <div className="flex items-center gap-2 mb-3">
                <FiDollarSign size={16} className="text-green-600" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                  Earnings
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Basic Salary *
                  </label>
                  <input
                    type="number"
                    value={formData.earnings.basicSalary}
                    onChange={(e) =>
                      handleEarningChange("basicSalary", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House Rent Allowance
                  </label>
                  <input
                    type="number"
                    value={formData.earnings.houseRentAllowance}
                    onChange={(e) =>
                      handleEarningChange("houseRentAllowance", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ex-Station Allowance
                  </label>
                  <input
                    type="number"
                    value={formData.earnings.conveyanceAllowance}
                    onChange={(e) =>
                      handleEarningChange("conveyanceAllowance", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Out Station Allowance
                  </label>
                  <input
                    type="number"
                    value={formData.earnings.medicalAllowance}
                    onChange={(e) =>
                      handleEarningChange("medicalAllowance", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Allowance
                  </label>
                  <input
                    type="number"
                    value={formData.earnings.specialAllowance}
                    onChange={(e) =>
                      handleEarningChange("specialAllowance", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Allowance
                  </label>
                  <input
                    type="number"
                    value={formData.earnings.otherAllowance}
                    onChange={(e) =>
                      handleEarningChange("otherAllowance", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white shadow-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="pt-3 mt-2 border-t-2 border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">
                      Total Earnings:
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-green-600">
                      ₹ {calculateTotalEarnings().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-100">
              <div className="flex items-center gap-2 mb-3">
                <FiDollarSign size={16} className="text-red-600" />
                <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                  Deductions
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provident Fund
                  </label>
                  <input
                    type="number"
                    value={formData.deductions.providentFund}
                    onChange={(e) =>
                      handleDeductionChange("providentFund", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Tax
                  </label>
                  <input
                    type="number"
                    value={formData.deductions.professionalTax}
                    onChange={(e) =>
                      handleDeductionChange("professionalTax", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Income Tax
                  </label>
                  <input
                    type="number"
                    value={formData.deductions.incomeTax}
                    onChange={(e) =>
                      handleDeductionChange("incomeTax", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan
                  </label>
                  <input
                    type="number"
                    value={formData.deductions.loan}
                    onChange={(e) =>
                      handleDeductionChange("loan", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Deductions
                  </label>
                  <input
                    type="number"
                    value={formData.deductions.otherDeductions}
                    onChange={(e) =>
                      handleDeductionChange("otherDeductions", e.target.value)
                    }
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="pt-3 mt-2 border-t-2 border-red-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-700">
                      Total Deductions:
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-red-600">
                      ₹ {calculateTotalDeductions().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 mb-3 sm:mb-4 border-2 border-blue-200 shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-base sm:text-lg font-bold text-gray-800">
                Net Salary:
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                ₹ {calculateNetSalary().toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-blue-100">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
              Payment Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentMethod: e.target.value })
                  }
                  className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                  required
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer ID *
                </label>
                <input
                  type="text"
                  value={formData.transferId}
                  onChange={(e) =>
                    setFormData({ ...formData, transferId: e.target.value })
                  }
                  className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                  placeholder="e.g., TXN123456789"
                  required
                />
              </div>
            </div>

            {formData.paymentMethod === "UPI" && (
              <div className="mb-3 sm:mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receiver UPI ID *
                </label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) =>
                    setFormData({ ...formData, upiId: e.target.value })
                  }
                  className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                  placeholder="e.g., employee@paytm"
                  required
                />
              </div>
            )}
          </div>

          {/* Bank Details */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 border border-gray-200">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
              Bank Details *
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className={formData.paymentMethod === "UPI" ? "sm:col-span-2" : ""}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={formData.bankDetails.bankName}
                  onChange={(e) =>
                    handleBankDetailsChange("bankName", e.target.value)
                  }
                  className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white shadow-sm"
                  placeholder="e.g., State Bank of India"
                  required
                />
              </div>
              {formData.paymentMethod === "Bank Transfer" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) =>
                      handleBankDetailsChange("accountNumber", e.target.value)
                    }
                    className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white shadow-sm"
                    placeholder="e.g., 1234567890"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              className="w-full px-3 py-3 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white shadow-sm"
              rows="2"
              placeholder="Any additional notes or remarks..."
            />
          </div>
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-5 border-t-2 border-gray-200 bg-gray-50 px-4 sm:px-5 pb-4 sm:pb-5">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto min-w-[120px] px-6 py-2.5 text-sm sm:text-base border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto min-w-[180px] px-6 py-2.5 text-sm sm:text-base bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 active:bg-cyan-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Salary Slip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSalarySlipModal;
