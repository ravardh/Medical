import React, { useEffect, useState } from "react";
import axios from "../config/api.jsx";
import { StarIcon, EyeIcon } from "@heroicons/react/24/solid";

const ReviewContent = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/public/review");
        setReviews(Array.isArray(res.data.reviews) ? res.data.reviews : []);
      } catch (err) {
        setError("Failed to fetch reviews.");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    window.scrollTo(0, 0);
    fetchReviews();
  }, []);

  // Filter reviews based on search term
  const filteredReviews = reviews.filter((review) => {
    const term = searchTerm.toLowerCase();
    return (
      review.fullName?.toLowerCase().includes(term) ||
      review.email?.toLowerCase().includes(term) ||
      review.comment?.toLowerCase().includes(term)
    );
  });

  // Modal component for viewing review details
  const ViewReviewModal = ({ isOpen, onClose, review }) => {
    if (!isOpen || !review) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
          <h3 className="text-lg font-semibold mb-4">Review Details</h3>
          <div className="mb-2">
            <span className="font-medium">Name:</span> {review.fullName}
          </div>
          <div className="mb-2">
            <span className="font-medium">Email:</span> {review.email}
          </div>
          <div className="mb-2">
            <span className="font-medium">Rating:</span> {review.rating}{" "}
            <StarIcon className="inline h-5 w-5 text-yellow-400" />
          </div>
          <div className="mb-2">
            <span className="font-medium">Comment:</span>
            <div className="mt-1 p-2 bg-gray-100 rounded text-gray-800 whitespace-pre-line">
              {review.comment}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleViewReview = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const handleToggleApprove = async (review) => {
    try {
      const updated = { ...review, isApproved: !review.isApproved };
      await axios.patch(`/admin/review/${review._id}/approve`, {
        isApproved: updated.isApproved,
      });
      setReviews((prev) =>
        prev.map((r) =>
          r._id === review._id ? { ...r, isApproved: updated.isApproved } : r
        )
      );
    } catch (err) {
      setError("Failed to update approval status.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Product Reviews
      </h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <input
            type="search"
            placeholder="Search reviews..."
            className="border rounded-md px-4 py-2 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-cyan-600 font-semibold">
              Loading...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 font-semibold">
              {error}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {filteredReviews.length === 0 ? (
                  <p className="text-center py-8 text-gray-400">No reviews found.</p>
                ) : (
                  filteredReviews.map((review) => (
                    <div key={review._id} className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{review.fullName}</p>
                          <p className="text-xs text-gray-500">{review.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${review.isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {review.isApproved ? "Approved" : "Pending"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <span className="text-sm font-medium">{review.rating}</span>
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                      </div>
                      {review.comment && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{review.comment}</p>
                      )}
                      <div className="flex gap-3 border-t pt-3">
                        <button className="text-cyan-600 hover:text-cyan-800 flex items-center gap-1 text-sm font-medium" onClick={() => handleViewReview(review)}>
                          <EyeIcon className="h-4 w-4" /> View
                        </button>
                        <button
                          className={`px-3 py-1 rounded-full font-medium text-xs transition-colors ${review.isApproved ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"}`}
                          onClick={() => handleToggleApprove(review)}
                        >
                          {review.isApproved ? "Disapprove" : "Approve"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <table className="hidden sm:table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Comment
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReviews.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-400">
                        No reviews found.
                      </td>
                    </tr>
                  ) : (
                    filteredReviews.map((review) => (
                      <tr key={review._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {review.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {review.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-1">
                          {review.rating}{" "}
                          <StarIcon className="h-5 w-5 text-yellow-400 inline" />
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap max-w-xs truncate"
                          title={review.comment}
                        >
                          {review.comment}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              review.isApproved
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {review.isApproved ? "Approved" : "Pending"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                          <button
                            className="text-cyan-600 hover:text-cyan-800 flex items-center gap-1 mr-2"
                            onClick={() => handleViewReview(review)}
                          >
                            <EyeIcon className="h-5 w-5" /> View
                          </button>
                          <button
                            className={`px-3 py-1 rounded-full font-medium text-xs transition-colors ${
                              review.isApproved
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : "bg-green-100 text-green-600 hover:bg-green-200"
                            }`}
                            onClick={() => handleToggleApprove(review)}
                          >
                            {review.isApproved ? "Disapprove" : "Approve"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
      {/* Modal for viewing review details */}
      <ViewReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        review={selectedReview}
      />
    </div>
  );
};

export default ReviewContent;
