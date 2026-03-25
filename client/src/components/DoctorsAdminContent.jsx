import React, { useState, useEffect } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import { FiUser, FiMapPin, FiCalendar, FiPlus, FiDownload } from "react-icons/fi";
import AddDoctorAdminModal from "./modals/AddDoctorAdminModal";
import EditDoctorAdminModal from "./modals/EditDoctorAdminModal";
import * as XLSX from 'xlsx';

const DoctorsAdminContent = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [isEditDoctorModalOpen, setIsEditDoctorModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/doctors", {
        withCredentials: true,
      });
      setDoctors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      toast.error("Failed to fetch doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const searchLower = search.toLowerCase();
    return (
      doctor.name.toLowerCase().includes(searchLower) ||
      (doctor.clinicName && doctor.clinicName.toLowerCase().includes(searchLower)) ||
      (doctor.place && doctor.place.toLowerCase().includes(searchLower)) ||
      (doctor.createdBy?.name && doctor.createdBy.name.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredDoctors.map((doctor) => ({
        'Doctor Name': `Dr. ${doctor.name}`,
        'Clinic Name': doctor.clinicName || '-',
        'Place': doctor.place || '-',
        'Birthdate': doctor.birthdate ? formatDate(doctor.birthdate) : '-',
        'Added By': doctor.createdBy?.name || 'Admin',
        'Added On': formatDate(doctor.createdAt),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const colWidths = [
        { wch: 25 }, // Doctor Name
        { wch: 25 }, // Clinic Name
        { wch: 15 }, // Place
        { wch: 15 }, // Birthdate
        { wch: 20 }, // Added By
        { wch: 15 }, // Added On
      ];
      ws['!cols'] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Doctors');

      // Generate file name
      const fileName = `Doctors_List_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);
      
      toast.success(`Exported ${filteredDoctors.length} doctors to Excel`);
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
    <div className="p-3 sm:p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Doctors Management
      </h2>
      <div className="bg-white rounded-lg shadow p-3 sm:p-6">
        <div className="flex justify-between mb-6 flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setIsAddDoctorModalOpen(true)}
              className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors"
            >
              <FiPlus size={18} />
              Add New Doctor
            </button>
            <button
              onClick={exportToExcel}
              disabled={filteredDoctors.length === 0}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export to Excel"
            >
              <FiDownload size={18} />
              Export
            </button>
          </div>
          <input
            type="search"
            placeholder="Search doctors by name, clinic, place, or MR..."
            className="border rounded-md px-4 py-2 w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiUser size={48} className="mx-auto mb-4 opacity-50" />
            <p>No doctors found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-300 scrollbar-track-gray-100 rounded">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="bg-cyan-100 p-2 rounded-full mr-3 flex-shrink-0">
                      <FiUser size={24} className="text-cyan-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">
                        Dr. {doctor.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        By: {doctor.createdBy?.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                      title="Edit Doctor"
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setIsEditDoctorModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title="Delete Doctor"
                      onClick={async () => {
                        toast((t) => (
                          <div style={{ minWidth: 280 }} className="flex flex-col gap-3 p-2">
                            <div className="text-base font-semibold text-gray-800 mb-1">Confirm Deletion</div>
                            <div className="text-sm text-gray-700 mb-2">Are you sure you want to delete <b>Dr. {doctor.name}</b>?</div>
                            <div className="flex gap-3 justify-end">
                              <button
                                onClick={async () => {
                                  toast.dismiss(t.id);
                                  try {
                                    await axios.delete(`/admin/doctors/${doctor._id}`, { withCredentials: true });
                                    toast.success("Doctor deleted successfully");
                                    fetchDoctors();
                                  } catch (err) {
                                    toast.error(err.response?.data?.message || "Failed to delete doctor");
                                  }
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={() => toast.dismiss(t.id)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ), { duration: 10000 });
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {doctor.clinicName && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Clinic:</span>{" "}
                    {doctor.clinicName}
                  </div>
                )}

                {doctor.place && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <FiMapPin size={14} className="mr-1" />
                    {doctor.place}
                  </div>
                )}

                {doctor.birthdate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <FiCalendar size={14} className="mr-1" />
                    <span className="font-medium mr-1">DOB:</span>
                    {formatDate(doctor.birthdate)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      {isAddDoctorModalOpen && (
        <AddDoctorAdminModal
          isOpen={isAddDoctorModalOpen}
          onClose={() => setIsAddDoctorModalOpen(false)}
          onSuccess={() => {
            fetchDoctors();
            setIsAddDoctorModalOpen(false);
          }}
        />
      )}
      {/* Edit Doctor Modal */}
      {isEditDoctorModalOpen && selectedDoctor && (
        <EditDoctorAdminModal
          isOpen={isEditDoctorModalOpen}
          doctor={selectedDoctor}
          onClose={() => {
            setIsEditDoctorModalOpen(false);
            setSelectedDoctor(null);
          }}
          onSuccess={() => {
            fetchDoctors();
            setIsEditDoctorModalOpen(false);
            setSelectedDoctor(null);
          }}
        />
      )}
    </div>
  );
};

export default DoctorsAdminContent;
