import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from '../config/api'

const Hero = () => {
  const [sliderImages, setSliderImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        const res = await axios.get('/public/slider');
        setSliderImages(Array.isArray(res.data.sliders) ? res.data.sliders : []);
      } catch (error) {
        // Optionally show a toast or fallback
      }
    };
    fetchSliderImages();
  }, []);

  // Auto-slide every 4 seconds
  useEffect(() => {
    if (sliderImages.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sliderImages.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [sliderImages]);

  return (
    <div className="bg-[#325946]/90 text-white">
      <div className="container mx-auto px-4 lg:px-10 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Quality Healthcare Products
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-lg">
              Trusted by healthcare professionals and patients alike. Discover our range of premium medical products.
            </p>
            <Link 
              to="/products" 
              className="inline-block bg-white text-[#325946] px-8 py-3 rounded-full font-semibold hover:bg-[#a1cc59] hover:text-white transition-colors duration-300"
            >
              Explore Products
            </Link>
          </div>

          {/* Right Slider */}
          <div className="relative">
            <div className="relative aspect-[5/3] bg-[#325946] border-4 border-[#325946] rounded-2xl p-4 overflow-hidden">
              {sliderImages.length > 0 ? (
                <div
                  className="absolute inset-0 flex w-full h-full transition-transform duration-700 ease-in-out"
                  style={{
                    transform: `translateX(-${current * 100}%)`,
                  }}
                >
                  {sliderImages.map((img, idx) => (
                    <img
                      key={img._id}
                      src={img.imageUrl}
                      alt={img.imageName || 'Slider'}
                      className="flex-none w-full h-full object-cover rounded-xl"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200 text-lg">
                  No Images
                </div>
              )}
              {/* Dots */}
              {sliderImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {sliderImages.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-2 h-2 rounded-full ${idx === current ? 'bg-white' : 'bg-gray-400/60'} inline-block`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero