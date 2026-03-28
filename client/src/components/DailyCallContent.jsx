import React, { useState, useEffect, useRef } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import { FiCalendar, FiUser, FiSearch, FiPackage, FiAlertCircle, FiCheckCircle, FiXCircle } from "react-icons/fi";
import RequestExtensionModal from "./modals/RequestExtensionModal";

const DailyCallContent = ({ isEmployee = false }) => {
  const [doctors, setDoctors] = useState([]);
  const [products, setProducts] = useState([]);
  const [timeLimit, setTimeLimit] = useState(3);
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [isExtensionModalOpen, setIsExtensionModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    doctor: "",
    doctorSearch: "",
    date: "",
    products: [],
    remarks: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      // Use /mr/doctors for employees, /admin/doctors for admins
      const endpoint = isEmployee ? "/mr/doctors" : "/admin/doctors";
      const res = await axios.get(endpoint, {
        withCredentials: true,
      });
      const doctorsList = Array.isArray(res.data) ? res.data : [];
      setDoctors(doctorsList);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      toast.error("Failed to fetch doctors");
      setDoctors([]);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await axios.get("/public/getAllProducts");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to fetch products");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchProducts();
    if (isEmployee) {
      fetchTimeLimit();
      fetchExtensionRequests();
    }
  }, []);

  const fetchTimeLimit = async () => {
    try {
      const res = await axios.get("/mr/settings/daily-call-time-limit", {
        withCredentials: true,
      });
      setTimeLimit(res.data.timeLimit);
    } catch (error) {
      console.error("Error fetching time limit:", error);
    }
  };

  const fetchExtensionRequests = async () => {
    try {
      const res = await axios.get("/mr/time-extension-requests", {
        withCredentials: true,
      });
      setExtensionRequests(res.data);
    } catch (error) {
      console.error("Error fetching extension requests:", error);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5);
    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, '0');
    const day = String(minDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMaxDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateAllowed = (date) => {
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - (timeLimit - 1));
    
    if (selectedDate >= minDate && selectedDate <= today) {
      return true;
    }
    
    // Check if there's an approved extension that covers this date
    return extensionRequests.some(
      req => {
        if (!req.requestedDate) return false;
        const requestedDateStr = req.requestedDate.includes('T') ? req.requestedDate.split('T')[0] : req.requestedDate;
        const reqDate = new Date(requestedDateStr + 'T00:00:00');
        return req.status === 'approved' && selectedDate.getTime() === reqDate.getTime();
      }
    );
  };

  const isDateCoveredByExtension = (date) => {
    if (!date) return false;
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - (timeLimit - 1));
    
    // Check if date is outside normal range
    if (selectedDate >= minDate && selectedDate <= today) {
      return false;
    }
    
    // Check if there's an approved extension that covers this date
    const isApproved = extensionRequests.some(
      req => {
        if (!req.requestedDate) return false;
        const requestedDateStr = req.requestedDate.includes('T') ? req.requestedDate.split('T')[0] : req.requestedDate;
        const reqDate = new Date(requestedDateStr + 'T00:00:00');
        return req.status === 'approved' && selectedDate.getTime() === reqDate.getTime();
      }
    );
    
    return isApproved;
  };

  const isDateRejected = (date) => {
    if (!date) return null;
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - (timeLimit - 1));
    
    // Check if date is outside normal range
    if (selectedDate >= minDate && selectedDate <= today) {
      return null;
    }
    
    // Check if there's a rejected extension request for this date
    return extensionRequests.find(
      req => {
        if (!req.requestedDate) return false;
        const requestedDateStr = req.requestedDate.includes('T') ? req.requestedDate.split('T')[0] : req.requestedDate;
        const reqDate = new Date(requestedDateStr + 'T00:00:00');
        return req.status === 'rejected' && selectedDate.getTime() === reqDate.getTime();
      }
    );
  };

  const isDatePending = (date) => {
    if (!date) return null;
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() - (timeLimit - 1));
    
    // Check if date is outside normal range
    if (selectedDate >= minDate && selectedDate <= today) {
      return null;
    }
    
    // Check if there's a pending extension request for this date
    return extensionRequests.find(
      req => {
        if (!req.requestedDate) return false;
        const requestedDateStr = req.requestedDate.includes('T') ? req.requestedDate.split('T')[0] : req.requestedDate;
        const reqDate = new Date(requestedDateStr + 'T00:00:00');
        return req.status === 'pending' && selectedDate.getTime() === reqDate.getTime();
      }
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductToggle = (productId) => {
    setFormData((prev) => {
      const products = prev.products.includes(productId)
        ? prev.products.filter((id) => id !== productId)
        : [...prev.products, productId];
      return { ...prev, products };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.doctor) {
      toast.error("Please select a doctor");
      setIsLoading(false);
      return;
    }

    if (!formData.date) {
      toast.error("Please select a date");
      setIsLoading(false);
      return;
    }

    if (!formData.products || formData.products.length === 0) {
      toast.error("Please select at least one product");
      setIsLoading(false);
      return;
    }

    if (!formData.remarks || formData.remarks.trim() === "") {
      toast.error("Please enter remarks or notes");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post("/mr/daily-call", formData, {
        withCredentials: true,
      });
      toast.success("Daily call report submitted successfully");
      // Reset form
      setFormData({
        doctor: "",
        doctorSearch: "",
        date: "",
        products: [],
        remarks: "",
      });
      setShowDropdown(false);
    } catch (error) {
      console.error("Error submitting daily call:", error);
      toast.error(error.response?.data?.message || "Failed to submit daily call");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingDoctors) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
        Submit Daily Call Report
      </h2>
      
      <div className="bg-white rounded-lg shadow p-4 sm:p-5 md:p-6 max-w-2xl mx-auto">
        {doctors.length === 0 ? (
          <div className="text-center py-12">
            <FiUser size={48} className="mx-auto mb-4 opacity-50 text-gray-400" />
            <p className="text-gray-600 mb-4">
              No doctors found. Please add doctors first before submitting call reports.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 sm:space-y-6">
              {/* Doctor Selection with Integrated Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Doctor <span className="text-red-500">*</span>
                </label>
                
                {/* Custom Searchable Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search doctor..."
                      value={formData.doctorSearch}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, doctorSearch: e.target.value, doctor: "" }));
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="w-full border rounded-md px-3 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-base touch-manipulation"
                      required={!formData.doctor}
                    />
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>

                  {/* Dropdown List */}
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto">
                      {doctors
                        .filter((doctor) => {
                          const search = formData.doctorSearch.toLowerCase();
                          return (
                            doctor.name.toLowerCase().includes(search) ||
                            (doctor.clinicName && doctor.clinicName.toLowerCase().includes(search)) ||
                            (doctor.place && doctor.place.toLowerCase().includes(search)) ||
                            (doctor.city && doctor.city.toLowerCase().includes(search)) ||
                            (doctor.area && doctor.area.toLowerCase().includes(search))
                          );
                        })
                        .map((doctor) => (
                          <div
                            key={doctor._id}
                            onClick={() => {
                              const loc = doctor.place || doctor.city;
                              const area = doctor.area;
                              const locationStr = loc ? (area ? `${loc}, ${area}` : loc) : (area ? area : '');
                              setFormData(prev => ({
                                ...prev,
                                doctor: doctor._id,
                                doctorSearch: `Dr. ${doctor.name}${doctor.clinicName ? ` - ${doctor.clinicName}` : ""}${locationStr ? ` (${locationStr})` : ""}`
                              }));
                              setShowDropdown(false);
                            }}
                            className="px-3 py-3 hover:bg-cyan-50 cursor-pointer transition-colors touch-manipulation active:bg-cyan-100"
                          >
                            <div className="font-medium text-gray-900">Dr. {doctor.name}</div>
                            {(doctor.clinicName || doctor.place || doctor.city || doctor.area) && (
                              <div className="text-sm text-gray-600">
                                {doctor.clinicName && <span>{doctor.clinicName}</span>}
                                {doctor.clinicName && (doctor.place || doctor.city) && <span> • </span>}
                                {(doctor.place || doctor.city) && <span>{doctor.place || doctor.city}</span>}
                                {doctor.area && (doctor.place || doctor.city) && <span> • </span>}
                                {doctor.area && <span>{doctor.area}</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      {doctors.filter((doctor) => {
                        const search = formData.doctorSearch.toLowerCase();
                        return (
                          doctor.name.toLowerCase().includes(search) ||
                          (doctor.clinicName && doctor.clinicName.toLowerCase().includes(search)) ||
                          (doctor.place && doctor.place.toLowerCase().includes(search)) ||
                          (doctor.city && doctor.city.toLowerCase().includes(search)) ||
                          (doctor.area && doctor.area.toLowerCase().includes(search))
                        );
                      }).length === 0 && (
                        <div className="px-3 py-3 text-gray-500 text-center text-sm">
                          No doctors found
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Hidden input for form validation */}
                  <input
                    type="hidden"
                    name="doctor"
                    value={formData.doctor}
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-base touch-manipulation transition-all hover:border-gray-400"
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  You can select dates from the last 5 days
                </p>
                {isEmployee && formData.date && isDateCoveredByExtension(formData.date) && (() => {
                  const approvedRequest = extensionRequests.find(
                    req => {
                      if (!req.requestedDate) return false;
                      const requestedDateStr = req.requestedDate.includes('T') ? req.requestedDate.split('T')[0] : req.requestedDate;
                      const reqDate = new Date(requestedDateStr + 'T00:00:00');
                      const selectedDate = new Date(formData.date + 'T00:00:00');
                      return req.status === 'approved' && selectedDate.getTime() === reqDate.getTime();
                    }
                  );
                  const isWarning = approvedRequest?.isWarning;
                  return (
                    <div className={`mt-2 p-3 ${isWarning ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'} border rounded-md`}>
                      <div className="flex items-start gap-2">
                        <FiCheckCircle className={`${isWarning ? 'text-yellow-600' : 'text-green-600'} mt-0.5 flex-shrink-0`} />
                        <div className={`text-sm ${isWarning ? 'text-yellow-800' : 'text-green-800'}`}>
                          <p className="font-medium">{isWarning ? 'Extension Approved with Warning' : 'Extension Approved'}</p>
                          <p className="mt-1">
                            You have been granted access to submit reports for this date.
                            {isWarning && (
                              <span className="block mt-1 font-medium text-yellow-900">
                                ⚠️ This approval came with a warning. Please review the warning in your Warnings panel.
                              </span>
                            )}
                            {approvedRequest?.adminNote && (
                              <span className={`block mt-1 italic ${isWarning ? 'text-yellow-900 font-medium' : ''}`}>
                                {isWarning ? 'Warning: ' : 'Admin Note: '}{approvedRequest.adminNote}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {isEmployee && formData.date && isDatePending(formData.date) && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <FiAlertCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Extension Request Pending</p>
                        <p className="mt-1">
                          Your extension request for this date is awaiting admin approval. Please wait for the admin to review your request.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {isEmployee && formData.date && isDateRejected(formData.date) && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <FiXCircle className="text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-800">
                        <p className="font-medium">Extension Request Rejected</p>
                        <p className="mt-1">
                          Your extension request for this date was rejected by admin.
                          {isDateRejected(formData.date).adminNote && (
                            <span className="block mt-1 italic">
                              Reason: {isDateRejected(formData.date).adminNote}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {isEmployee && formData.date && !isDateAllowed(formData.date) && !isDateRejected(formData.date) && !isDatePending(formData.date) && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex items-start gap-2">
                      <FiAlertCircle className="text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium">Date outside allowed range</p>
                        <p className="mt-1">
                          You can only submit reports for the last {timeLimit} days.
                          <button
                            type="button"
                            onClick={() => setIsExtensionModalOpen(true)}
                            className="ml-2 text-cyan-600 hover:text-cyan-700 font-medium underline"
                          >
                            Request extension
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Products Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Products Shown <span className="text-red-500">*</span>
                </label>

                {loadingProducts ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="border rounded-md p-4 bg-yellow-50">
                    <p className="text-sm text-gray-700">
                      No products available. Please add products in the admin panel first.
                    </p>
                  </div>
                ) : (
                  <>
                    <select
                      className="w-full border rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-2 text-base touch-manipulation"
                      onChange={(e) => {
                        if (e.target.value && !formData.products.includes(e.target.value)) {
                          handleProductToggle(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      value=""
                    >
                      <option value="">-- Select Product to Add --</option>
                      {products
                        .filter((product) => !formData.products.includes(product._id))
                        .map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.productName || "Unnamed Product"}
                          </option>
                        ))}
                    </select>

                    {/* Selected Products Display */}
                    {formData.products.length > 0 && (
                      <div className="border rounded-md p-3 bg-gray-50">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Selected Products ({formData.products.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.products.map((productId) => {
                            const product = products.find((p) => p._id === productId);
                            return product ? (
                              <span
                                key={productId}
                                className="inline-flex items-center bg-cyan-100 text-cyan-800 rounded-full px-3 py-1 text-sm font-medium shadow-sm border border-cyan-200 max-w-full"
                              >
                                <FiPackage className="mr-1 text-cyan-500" />
                                <span className="truncate max-w-[140px]">{product.productName}</span>
                                <button
                                  type="button"
                                  onClick={() => handleProductToggle(productId)}
                                  className="ml-2 text-cyan-600 hover:text-red-500 focus:outline-none"
                                  title="Remove"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks / Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full border rounded-md px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-base touch-manipulation resize-y"
                  placeholder="Enter any remarks or notes about the visit..."
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 active:bg-cyan-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium touch-manipulation"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit Call Report"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Request Extension Modal */}
      {isEmployee && (
        <RequestExtensionModal
          isOpen={isExtensionModalOpen}
          onClose={() => setIsExtensionModalOpen(false)}
          selectedDate={formData.date}
          onSuccess={() => {
            fetchExtensionRequests();
          }}
        />
      )}
    </div>
  );
};

export default DailyCallContent;
