import React, { useState, useEffect } from "react";
import axios from "../../config/api";
import toast from "react-hot-toast";
import { AiOutlineClose } from "react-icons/ai";

const MP_PLACES = [
  "Bhopal",
  "Indore",
  "Jabalpur",
  "Gwalior",
  "Ujjain",
  "Sagar",
  "Dewas",
  "Satna",
  "Ratlam",
  "Rewa",
  "Katni",
  "Singrauli",
  "Burhanpur",
  "Khandwa",
  "Morena",
  "Bhind",
  "Chhindwara",
  "Guna",
  "Shivpuri",
  "Vidisha",
  "Chhatarpur",
  "Damoh",
  "Mandsaur",
  "Khargone",
  "Neemuch",
  "Pithampur",
  "Hoshangabad",
  "Itarsi",
  "Sehore",
  "Betul",
  "Seoni",
  "Datia",
  "Nagda",
  "Dhar",
].sort();

const EditDoctorModal = ({ isOpen, onClose, doctor, onSuccess, isEmployee = false }) => {
  const [formData, setFormData] = useState({
    name: "",
    clinicName: "",
    place: "",
    birthdate: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || "",
        clinicName: doctor.clinicName || "",
        place: doctor.place || "",
        birthdate: doctor.birthdate ? new Date(doctor.birthdate).toISOString().split('T')[0] : "",
      });
    }
  }, [doctor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.name) {
      toast.error("Doctor name is required");
      setIsLoading(false);
      return;
    }

    try {
      // Use /mr/doctors for employees, /admin/doctors for admins
      const endpoint = isEmployee ? "/mr/doctors" : "/admin/doctors";
      await axios.put(`${endpoint}/${doctor._id}`, formData, {
        withCredentials: true,
      });
      toast.success("Doctor updated successfully");
      onSuccess();
    } catch (error) {
      console.error("Error updating doctor:", error);
      toast.error(error.response?.data?.message || "Failed to update doctor");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-4 px-4 sm:py-8">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-2xl font-semibold text-gray-800">Edit Doctor</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <AiOutlineClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter doctor name"
                required
              />
            </div>

            {/* Clinic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinic Name
              </label>
              <input
                type="text"
                name="clinicName"
                value={formData.clinicName}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Enter clinic name"
              />
            </div>

            {/* Place */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Place
              </label>
              <select
                name="place"
                value={formData.place}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">-- Select Place --</option>
                {MP_PLACES.map((place) => (
                  <option key={place} value={place}>
                    {place}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="place"
                value={MP_PLACES.includes(formData.place) ? "" : formData.place}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Or type custom place name"
              />
            </div>

            {/* Birthdate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Birthdate (Optional)
              </label>
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleInputChange}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Doctor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDoctorModal;
