import React, { useState, useEffect } from "react";
import axios from "../../config/api";
import toast from "react-hot-toast";

const EditProductModal = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [formData, setFormData] = useState({
    uniqueId: "",
    productName: "",
    brandName: "",
    mrp: "",
    shelfLife: "",
    productForm: "",
    consumeType: "",
    isVeg: false,
    keyIngredient: "",
    strength: "",
    flavourColor: "",
    isReturnable: false,
    productWeight: "",
    packagingLength: "",
    packagingBreadth: "",
    packagingHeight: "",
    uses: "",
    targetAge: "All",
    images: [],
    productInformation: "",
    Tata1Mg: "",
    keyBenefits: "",
    directionForUse: "",
    isfeatured: false,
    isAvailable: true,
  });
  const [imagePreview, setImagePreview] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        uniqueId: product.uniqueId || "",
        productName: product.productName || "",
        brandName: product.brandName || "",
        mrp: product.mrp || "",
        shelfLife: product.shelfLife || "",
        productForm: product.productForm || "",
        consumeType: product.consumeType || "",
        isVeg: product.isVeg || false,
        keyIngredient: product.keyIngredient || "",
        strength: product.strength || "",
        flavourColor: product.flavourColor || "",
        isReturnable: product.isReturnable || false,
        productWeight: product.productWeight || "",
        packagingLength: product.packagingLength || "",
        packagingBreadth: product.packagingBreadth || "",
        packagingHeight: product.packagingHeight || "",
        uses: product.uses || "",
        targetAge: product.targetAge || "All",
        images: product.images || [],
        productInformation: product.productInformation || "",
        Tata1Mg: product.Tata1Mg || "",
        keyBenefits: product.keyBenefits || "",
        directionForUse: product.directionForUse || "",
        isfeatured: product.isfeatured || false,
        isAvailable: product.isAvailable || true,
      });
      setImagePreview(product.images || []);
    }
  }, [product]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    
    // Create preview URLs for new images
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...previews]);
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setNewImages(prev => prev.filter((_, i) => i !== (index - (formData.images.length))));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "images") {
          // Only append new images, existing images are already in the database
          newImages.forEach((image) => {
            formDataToSend.append("images", image);
          });
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.put(`/admin/products/${product._id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast.success("Product updated successfully!");
      onClose();
      if (onProductUpdated) {
        onProductUpdated();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-4 px-4 sm:py-8">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto no-scrollbar pb-5">
        <div className="flex justify-between items-center mb-4 p-4 md:p-6 sticky top-0 bg-white border-b">
          <h3 className="text-lg md:text-xl font-semibold">Edit Product</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 md:px-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unique ID
              </label>
              <input
                type="text"
                name="uniqueId"
                value={formData.uniqueId}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                name="brandName"
                value={formData.brandName}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MRP (₹)
              </label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              />
            </div>
          </div>

          {/* Product Specifications */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shelf Life (days)
              </label>
              <input
                type="number"
                name="shelfLife"
                value={formData.shelfLife}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Form
              </label>
              <input
                type="text"
                name="productForm"
                value={formData.productForm}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consume Type
              </label>
              <input
                type="text"
                name="consumeType"
                value={formData.consumeType}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Flavour/Color
              </label>
              <input
                type="text"
                name="flavourColor"
                value={formData.flavourColor}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
              />
            </div>
          </div>

          {/* Additional Specifications */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strength (v/v)
              </label>
              <input
                type="text"
                name="strength"
                value={formData.strength}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Age
              </label>
              <select
                name="targetAge"
                value={formData.targetAge}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              >
                <option value="All">All</option>
                <option value="Child">Child</option>
                <option value="Elderly">Elderly</option>
              </select>
            </div>
          </div>

          {/* Physical Specifications */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Weight (g)
              </label>
              <input
                type="number"
                name="productWeight"
                value={formData.productWeight}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Length (in)
                </label>
                <input
                  type="number"
                  name="packagingLength"
                  value={formData.packagingLength}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breadth (in)
                </label>
                <input
                  type="number"
                  name="packagingBreadth"
                  value={formData.packagingBreadth}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (in)
                </label>
                <input
                  type="number"
                  name="packagingHeight"
                  value={formData.packagingHeight}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                  required
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="col-span-1 lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Ingredient
              </label>
              <input
                type="text"
                name="keyIngredient"
                value={formData.keyIngredient}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uses
              </label>
              <textarea
                name="uses"
                value={formData.uses}
                onChange={handleInputChange}
                rows="2"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Information
              </label>
              <textarea
                name="productInformation"
                value={formData.productInformation}
                onChange={handleInputChange}
                rows="3"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Benefits
              </label>
              <textarea
                name="keyBenefits"
                value={formData.keyBenefits}
                onChange={handleInputChange}
                rows="3"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction For Use
              </label>
              <textarea
                name="directionForUse"
                value={formData.directionForUse}
                onChange={handleInputChange}
                rows="3"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tata 1Mg Link
              </label>
              <input
                type="url"
                name="Tata1Mg"
                value={formData.Tata1Mg}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 p-2 md:p-3"
              />
            </div>
          </div>

          {/* Additional Options */}
          <div className="col-span-1 lg:col-span-2 flex flex-col sm:flex-row flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isVeg"
                checked={formData.isVeg}
                onChange={handleInputChange}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Is Vegetarian</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isReturnable"
                checked={formData.isReturnable}
                onChange={handleInputChange}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Is Returnable</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isfeatured"
                checked={formData.isfeatured}
                onChange={handleInputChange}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Is Featured</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">Is Available</label>
            </div>
          </div>

          {/* Image Upload and Preview */}
          <div className="col-span-1 lg:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add New Images
              </label>
              <input
                type="file"
                multiple
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 p-2 md:p-3"
                accept="image/*"
              />
            </div>
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreview.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 sm:h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="col-span-1 lg:col-span-2 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal; 