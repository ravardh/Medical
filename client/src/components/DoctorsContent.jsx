import React, { useState, useEffect } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import AddDoctorAdminModal from "./modals/AddDoctorAdminModal";
import EditDoctorModal from "./modals/EditDoctorModal";
import { FiEdit, FiMapPin, FiUser, FiCalendar } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const DoctorsContent = ({ isEmployee = false }) => {
  const { user } = useAuth();
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [isEditDoctorModalOpen, setIsEditDoctorModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Use /mr/doctors for employees, /admin/doctors for admins
      const endpoint = isEmployee ? "/mr/doctors" : "/admin/doctors";
      const res = await axios.get(endpoint, {
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

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(search.toLowerCase()) ||
      (doctor.clinicName && doctor.clinicName.toLowerCase().includes(search.toLowerCase())) ||
      (doctor.place && doctor.place.toLowerCase().includes(search.toLowerCase())) ||
      (doctor.city && doctor.city.toLowerCase().includes(search.toLowerCase())) ||
      (doctor.area && doctor.area.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEdit = (doctor) => {
    setSelectedDoctor(doctor);
    setIsEditDoctorModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
        {isEmployee ? "My Doctors" : "All Doctors"}
      </h2>
      <div className="bg-white rounded-lg shadow p-3 sm:p-6">
        <div className="flex justify-between mb-6 flex-wrap gap-4">
          <button
            onClick={() => setIsAddDoctorModalOpen(true)}
            className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors"
          >
            Add New Doctor
          </button>
          <input
            type="search"
            placeholder="Search doctors..."
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
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
                      {isEmployee && doctor.createdBy && (
                        <p className="text-xs text-gray-500">
                          {doctor.createdBy._id === user?.id 
                            ? "Your doctor" 
                            : `By: ${doctor.createdBy.name || "Admin"}`}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Show edit button for both admin and employee */}
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="text-cyan-600 hover:text-cyan-800 p-2 rounded-full hover:bg-cyan-50 transition-colors"
                    title="Edit Doctor"
                  >
                    <FiEdit size={18} />
                  </button>
                </div>
                
                {doctor.clinicName && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Clinic:</span> {doctor.clinicName}
                  </div>
                )}
                
                {(doctor.place || doctor.city || doctor.area) && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <FiMapPin size={14} className="mr-1" />
                    {doctor.place || doctor.city}{doctor.area ? `, ${doctor.area}` : ''}
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

      {/* Modals */}
      {isAddDoctorModalOpen && (
        <AddDoctorAdminModal
          isOpen={isAddDoctorModalOpen}
          isEmployee={isEmployee}
          onClose={() => setIsAddDoctorModalOpen(false)}
          onSuccess={() => {
            fetchDoctors();
            setIsAddDoctorModalOpen(false);
          }}
        />
      )}

      {isEditDoctorModalOpen && (
        <EditDoctorModal
          isOpen={isEditDoctorModalOpen}
          isEmployee={isEmployee}
          onClose={() => {
            setIsEditDoctorModalOpen(false);
            setSelectedDoctor(null);
          }}
          doctor={selectedDoctor}
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

export default DoctorsContent;
