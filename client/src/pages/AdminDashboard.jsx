import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import axios from "../config/api";
import { useAuth } from "../context/AuthContext";
import {
  AiOutlineDashboard,
  AiOutlineLogout,
  AiOutlineStar,
} from "react-icons/ai";
import { BsImages } from "react-icons/bs";
import { BiPackage } from "react-icons/bi";
import { MdContactSupport } from "react-icons/md";
import { FiUsers, FiClipboard, FiUser, FiChevronDown, FiFileText, FiSettings, FiAlertCircle, FiCalendar, FiDollarSign } from "react-icons/fi";
import DashboardContent from "../components/DashboardContent";
import ProductsContent from "../components/ProductsContent";
import SliderContent from "../components/SliderContent";
import ContactContent from "../components/ContactContent";
import ReviewContent from "../components/ReviewContent";
import UsersContent from "../components/UsersContent";
import DailyCallsAdminContent from "../components/DailyCallsAdminContent";
import DoctorsAdminContent from "../components/DoctorsAdminContent";
import SalarySlipContent from "../components/SalarySlipContent";
import SettingsContent from "../components/SettingsContent";
import EmployeeWarningsContent from "../components/EmployeeWarningsContent";
import LeaveManagementContent from "../components/LeaveManagementContent";
import ExpenseAdminContent from "../components/ExpenseAdminContent";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSlider: 0,
    totalContacts: 0,
    totalFeatured: 0,
    totalUnApprovedReviews: 0,
    totalReviews: 0,
    totalUsers: 0,
  });
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [pendingLeavesCount, setPendingLeavesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("/admin/stats", {
          withCredentials: true,
        });
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    };
    
    const fetchPendingRequestsCount = async () => {
      try {
        const response = await axios.get("/admin/time-extension-requests", {
          withCredentials: true,
        });
        const pendingCount = response.data.filter(req => req.status === "pending").length;
        setPendingRequestsCount(pendingCount);
      } catch (error) {
        console.error("Error fetching pending requests count:", error);
      }
    };

    const fetchPendingLeavesCount = async () => {
      try {
        const response = await axios.get("/admin/leaves/pending/count", {
          withCredentials: true,
        });
        setPendingLeavesCount(response.data.count);
      } catch (error) {
        console.error("Error fetching pending leaves count:", error);
      }
    };
    
    window.scrollTo(0, 0);
    // Check if admin token exists in local storage
    const adminToken = localStorage.getItem("adminToken");
    const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));

    if (!adminToken) {
      navigate("/login");
      return;
    }

    // Check if user is admin
    if (adminInfo?.user?.role !== "admin") {
      navigate("/employee-dashboard");
      return;
    }

    fetchStats();
    fetchPendingRequestsCount();
    fetchPendingLeavesCount();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear cookies
      await axios.post(
        "/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      // Clear auth context and local storage
      logout();
      // Optionally, clear cookies if needed
      Cookies.remove("jwt");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API fails, clear local auth
      logout();
    }
    navigate("/login");
  };

  const refreshPendingCount = async () => {
    try {
      const response = await axios.get("/admin/time-extension-requests", {
        withCredentials: true,
      });
      const pendingCount = response.data.filter(req => req.status === "pending").length;
      setPendingRequestsCount(pendingCount);
      
      // Also refresh leaves count
      const leavesResponse = await axios.get("/admin/leaves/pending/count", {
        withCredentials: true,
      });
      setPendingLeavesCount(leavesResponse.data.count);
    } catch (error) {
      console.error("Error refreshing pending requests count:", error);
    }
  };

  const menuItems = [
    {
      id: "dashboard",
      icon: <AiOutlineDashboard size={20} />,
      title: "Dashboard",
      type: "single",
    },
    {
      id: "content",
      icon: <BiPackage size={20} />,
      title: "Content",
      type: "dropdown",
      items: [
        { id: "products", icon: <BiPackage size={18} />, title: "Products" },
        { id: "slider", icon: <BsImages size={18} />, title: "Slider Images" },
      ],
    },
    {
      id: "communications",
      icon: <MdContactSupport size={20} />,
      title: "Communications",
      type: "dropdown",
      items: [
        { id: "contacts", icon: <MdContactSupport size={18} />, title: "Contact Us" },
        { id: "reviews", icon: <AiOutlineStar size={18} />, title: "Reviews" },
      ],
    },
    {
      id: "management",
      icon: <FiUsers size={20} />,
      title: "Management",
      type: "dropdown",
      items: [
        { id: "users", icon: <FiUsers size={18} />, title: "Employees" },
        { id: "doctors", icon: <FiUser size={18} />, title: "Doctors" },
        { id: "daily-calls", icon: <FiClipboard size={18} />, title: "Daily Call Reports" },
        { id: "expenses", icon: <FiDollarSign size={18} />, title: "Expense Statements" },
        { id: "salary-slips", icon: <FiFileText size={18} />, title: "Salary Slips" },
        { id: "leaves", icon: <FiCalendar size={18} />, title: "Leave Applications", badge: pendingLeavesCount },
        { id: "employee-warnings", icon: <FiAlertCircle size={18} />, title: "Employee Warnings" },
      ],
    },
    {
      id: "settings",
      icon: <FiSettings size={20} />,
      title: "Time Extension Requests",
      type: "single",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent stats={stats} />;
      case "products":
        return <ProductsContent />;
      case "slider":
        return <SliderContent />;
      case "contacts":
        return <ContactContent />;
      case "reviews":
        return <ReviewContent />;
      case "users":
        return <UsersContent />;
      case "doctors":
        return <DoctorsAdminContent />;
      case "daily-calls":
        return <DailyCallsAdminContent />;
      case "expenses":
        return <ExpenseAdminContent />;
      case "salary-slips":
        return <SalarySlipContent />;
      case "leaves":
        return <LeaveManagementContent />;
      case "employee-warnings":
        return <EmployeeWarningsContent />;
      case "settings":
        return <SettingsContent refreshPendingCount={refreshPendingCount} />;
      default:
        return <DashboardContent stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h2 className="text-lg font-bold text-cyan-800">Medical Admin</h2>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
              {menuItems.map((item) => (
                <div key={item.id} className="relative">
                  {item.type === "single" ? (
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setOpenDropdown(null);
                      }}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium relative ${
                        activeTab === item.id
                          ? "bg-cyan-600 text-white"
                          : "text-gray-700 hover:bg-cyan-50 hover:text-cyan-600"
                      } transition-colors duration-200`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      <span>{item.title}</span>
                      {item.id === "settings" && pendingRequestsCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {pendingRequestsCount}
                        </span>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                          item.items.some((subItem) => activeTab === subItem.id)
                            ? "bg-cyan-600 text-white"
                            : "text-gray-700 hover:bg-cyan-50 hover:text-cyan-600"
                        } transition-colors duration-200`}
                      >
                        <span className="mr-2">{item.icon}</span>
                        <span>{item.title}</span>
                        <FiChevronDown
                          size={16}
                          className={`ml-1 transition-transform ${
                            openDropdown === item.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openDropdown === item.id && (
                        <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 py-1">
                          {item.items.map((subItem) => (
                            <button
                              key={subItem.id}
                              onClick={() => {
                                setActiveTab(subItem.id);
                                setOpenDropdown(null);
                              }}
                              className={`flex items-center w-full px-4 py-2 text-sm ${
                                activeTab === subItem.id
                                  ? "bg-cyan-50 text-cyan-600 font-medium"
                                  : "text-gray-700 hover:bg-cyan-50 hover:text-cyan-600"
                              } transition-colors duration-200`}
                            >
                              <span className="mr-3">{subItem.icon}</span>
                              <span>{subItem.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                <AiOutlineLogout size={20} className="mr-2" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-cyan-600 hover:bg-cyan-50"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen pb-3' : 'max-h-0'} space-y-1`}>
              {menuItems.map((item) => (
                <div key={item.id}>
                  {item.type === "single" ? (
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center w-full px-3 py-2 rounded-md relative ${
                        activeTab === item.id
                          ? "bg-cyan-600 text-white"
                          : "text-gray-700 hover:bg-cyan-50 hover:text-cyan-600"
                      } transition-colors duration-200`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.title}</span>
                      {item.id === "settings" && pendingRequestsCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {pendingRequestsCount}
                        </span>
                      )}
                    </button>
                  ) : (
                    <>
                      <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {item.title}
                      </div>
                      {item.items.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => {
                            setActiveTab(subItem.id);
                            setIsMenuOpen(false);
                          }}
                          className={`flex items-center w-full px-6 py-2 rounded-md ${
                            activeTab === subItem.id
                              ? "bg-cyan-50 text-cyan-600 font-medium"
                              : "text-gray-600 hover:bg-cyan-50 hover:text-cyan-600"
                          } transition-colors duration-200`}
                        >
                          <span className="mr-3">{subItem.icon}</span>
                          <span>{subItem.title}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              ))}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-3 py-2 mt-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                <AiOutlineLogout size={20} className="mr-3" />
                <span>Logout</span>
              </button>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
