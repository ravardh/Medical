import React, { useEffect, useState, useRef } from "react";
import axios from "../config/api.jsx";
import { StarIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get("/public/review");
        setReviews(Array.isArray(res.data.reviews) ? res.data.reviews.filter(r => r.isApproved) : []);
      } catch {
        setReviews([]);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [reviews]);

  if (reviews.length === 0) {
    return (
      <div className="py-4 text-center text-gray-400">No testimonials available yet.</div>
    );
  }

  // Mobile: animated slider
  if (isMobile) {
    const review = reviews[current];
    return (
      <div className="py-4 bg-gray-50">
        <h2 className="text-2xl font-bold text-center text-[#325946] mb-8">What Our Customers Say</h2>
        <div className="flex justify-center">
          <div className="w-full max-w-xs mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={review._id}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="bg-white border rounded-xl shadow-lg p-6 w-full"
              >
                <div className="flex items-center gap-3 mb-2">
                  {[1,2,3,4,5].map((star) => (
                    <StarIcon key={star} className={`h-5 w-5 ${review.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-gray-700 text-base italic mb-4">"{review.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                    {review.fullName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{review.fullName}</div>
                    <div className="text-xs text-gray-500">{review.userType || 'Customer'}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: circular carousel
  const total = reviews.length;
  const radius = 620; // px
  const cardWidth = 540; // px

  return (
    <div className="py-4 bg-gray-50">
      <h2 className="text-3xl font-bold text-center text-[#325946]">What Our Customers Say</h2>
      <div className="flex justify-center">
        <div className="relative w-full max-w-[1100px] h-[420px] flex items-center justify-center overflow-visible px-2 md:px-0">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
            {reviews.map((review, idx) => {
              // Calculate angle for each card
              const angle = (360 / total) * ((idx - current + total) % total);
              // Center card and runner-up logic
              const isCenter = angle === 0;
              const isRunnerUp = angle === 360 / total;
              return (
                <div
                  key={review._id}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    minWidth: isCenter ? '33vw' : '20vw',
                    maxWidth: isCenter ? '540px' : '340px',
                    width: isCenter ? '33vw' : '20vw',
                    transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px)`,
                    zIndex: isCenter ? 3 : isRunnerUp ? 2 : 1,
                    opacity: isCenter ? 1 : isRunnerUp ? 0.5 : 0.1,
                    filter: isRunnerUp ? 'blur(3px)' : isCenter ? 'none' : 'blur(6px)',
                    transition: 'transform 1s cubic-bezier(.4,0,.2,1), opacity 0.7s, filter 0.7s',
                    pointerEvents: isCenter ? 'auto' : 'none',
                  }}
                  className={`bg-white border rounded-xl shadow-lg p-8 transition-all duration-700 ${isCenter ? '' : 'pointer-events-none'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {[1,2,3,4,5].map((star) => (
                      <StarIcon key={star} className={`h-5 w-5 ${review.rating >= star ? 'text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-gray-700 text-lg italic mb-4">"{review.comment}"</p>
                  <div className="flex items-center gap-3">
                    <div className="bg-cyan-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                      {review.fullName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{review.fullName}</div>
                      <div className="text-xs text-gray-500">{review.userType || 'Customer'}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
