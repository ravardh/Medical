import React, { useState, useEffect } from "react";
import axios from "../config/api.jsx";
import { StarIcon } from "@heroicons/react/24/solid";

const PostReview = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    product: "",
    rating: 0,
    comment: "",
    userType: "Customer",
  });
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/public/getAllProducts");
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRating = (value) => {
    setForm({ ...form, rating: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess("");
    setError("");
    try {
      await axios.post("/public/review", form);
      setSuccess("Review submitted successfully! Thank you for your feedback.");
      setForm({ fullName: "", email: "", phone: "", product: "", rating: 0, comment: "", userType: "Customer" });
    } catch (err) {
      setError("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 flex justify-center py-12 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2/3">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Post a Review</h2>
        <p className="text-center text-[#325946] font-medium mb-6 italic">Your words can inspire others—share your experience and help someone make the right choice!</p>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative pb-12">
          {/* Left Side */}
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#a1cc59]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#a1cc59]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#a1cc59]"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">User Type</label>
              <div className="flex gap-6 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="Customer"
                    checked={form.userType === "Customer"}
                    onChange={handleChange}
                    className="accent-[#325946]"
                  />
                  <span>Customer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="userType"
                    value="Doctor"
                    checked={form.userType === "Doctor"}
                    onChange={handleChange}
                    className="accent-[#325946]"
                  />
                  <span>Doctor</span>
                </label>
              </div>
            </div>
          </div>
          {/* Right Side */}
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Product Name</label>
              <select
                name="product"
                value={form.product}
                onChange={handleChange}
                required
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#a1cc59]"
              >
                <option value="" disabled>Select a product</option>
                {products.map((prod) => (
                  <option key={prod._id} value={prod._id}>{prod.productName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => handleRating(star)}
                    className="focus:outline-none"
                  >
                    <StarIcon
                      className={`h-7 w-7 ${form.rating >= star ? "text-[#325946]" : "text-gray-300"}`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-gray-600">{form.rating} / 5</span>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Comment</label>
              <textarea
                name="comment"
                value={form.comment}
                onChange={handleChange}
                required
                rows={4}
                className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#a1cc59]"
              />
            </div>
          </div>
          {/* Submit Button Centered Below */}
          <div className="absolute left-0 right-0 bottom-0 flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="w-48 bg-[#a1cc59] text-white font-semibold py-2 rounded-md shadow hover:bg-[#96b463] transition-colors disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            
          </div>
          

        </form>
         {success && <div className="my-4 text-center text-green-600 font-medium">{success}</div>}
        {error && <div className="my-4 text-center text-red-600 font-medium">{error}</div>}
       
      </div>
    </div>
  );
};

export default PostReview;
