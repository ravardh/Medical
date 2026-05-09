import React, { useEffect, useState } from "react";
import axios from "../config/api";
import { toast } from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

const SliderContent = () => {
  const [sliders, setSliders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    imageName: "",
    imageUrl: "",
  });
  const [previewUrl, setPreviewUrl] = useState("");

  // Fetch all slider images
  const fetchSliderImages = async () => {
    try {
      const res = await axios.get("/public/slider");
      setSliders(Array.isArray(res.data.sliders) ? res.data.sliders : []);
    } catch (error) {
      toast.error("Failed to fetch slider images");
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSliderImages();
  }, []);

  // Clean up preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Add new slider image
  const handleAddImage = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("imageName", formData.imageName);
      data.append("imageUrl", formData.imageUrl); // imageUrl is now a File object

      const res = await axios.post("/admin/addImage", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      setFormData({ imageName: "", imageUrl: "" });
      setPreviewUrl("");
      setShowForm(false);
      fetchSliderImages();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add image");
    }
  };

  // Delete image
  const handleDelete = async (id) => {
    toast((t) => (
      <span className="flex flex-col gap-2">
        <span>Are you sure you want to delete this image?</span>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await axios.delete(`/admin/slider/${id}`);
                toast.success(res.data.message);
                fetchSliderImages();
              } catch (error) {
                toast.error("Failed to delete image");
              }
            }}
            className="bg-red-600 px-3 py-1 text-white rounded hover:bg-red-700"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
          >
            No
          </button>
        </div>
      </span>
    ));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Slider Images Management
      </h2>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Add Image Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700"
          >
            {showForm ? "Close Form" : "Add New Image"}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleAddImage} className="mb-6 space-y-4">
            <div className="lg:flex lg:gap-10 grid gap-5 ">
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Enter Image Name"
                value={formData.imageName}
                onChange={(e) =>
                  setFormData({ ...formData, imageName: e.target.value })
                }
                required
              />
              <input
                type="file"
                className="w-full border rounded px-3 py-2"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setFormData({ ...formData, imageUrl: file });
                  if (file) {
                    setPreviewUrl(URL.createObjectURL(file));
                  } else {
                    setPreviewUrl("");
                  }
                }}
                required
              />
            </div>
            <div className="lg:flex lg:gap-10 grid gap-5">
              <label className="block text-sm font-medium text-gray-700">
                Image Preview
              </label>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded mb-2 border"
                />
              ) : (
                <span className="text-sm">No Image Selected</span>
              )}
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Upload Image
            </button>
          </form>
        )}

        {/* Slider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sliders.map((item) => (
            <div key={item._id} className="border rounded-lg shadow-md">
              <img
                src={item.imageUrl}
                alt="Slider"
                className="w-full h-48 object-cover bg-gray-200"
              />
              <div className="p-4">              
                <div className="flex justify-center">
                  <button
                    onClick={() => handleDelete(item._id)}
                    className=" w-1/2 border p-2 bg-red-500 text-white rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* If no image */}
        {sliders.length === 0 && (
          <p className="text-gray-500 mt-4">No slider images found.</p>
        )}
      </div>
    </div>
  );
};

export default SliderContent;
