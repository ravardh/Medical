import React, { useEffect, useState } from 'react';
import axios from '../config/api.jsx';
import { 
  CurrencyRupeeIcon, 
  TagIcon, 
  CubeIcon, 
  UserIcon, 
  CakeIcon, 
  InformationCircleIcon, 
  ClipboardDocumentCheckIcon, 
  BeakerIcon, 
  ArrowTopRightOnSquareIcon,
  ShoppingBagIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import ProductViewModal from '../components/modals/ProductViewModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/public/getAllProducts');
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Failed to fetch products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Loading skeleton
  const ProductSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="bg-gray-200 h-48 w-full"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="flex space-x-2 pt-2">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Our Product Catalog
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-gray-500 sm:mt-4">
            Discover our range of high-quality products tailored for your needs
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <XMarkIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading products</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
              <CubeIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">We couldn't find any products matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div 
                key={product._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 border border-gray-100"
              >
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={product.images?.[0] || '/placeholder-product.png'}
                    alt={product.productName}
                    className="w-full h-full object-contain p-4"
                  />
                  {product.Tata1Mg && (
                    <span className="absolute top-2 right-2 bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded-full">
                      1Mg Verified
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">{product.productName}</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-1">{product.brandName}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-cyan-700 font-bold text-lg">₹{product.mrp}</span>
                    <div className="flex gap-2">
                      <button
                        className="flex items-center gap-2 px-4 py-2 bg-[#a1cc59] text-white font-semibold rounded-full shadow hover:bg-[#96b463] transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsModalOpen(true);
                        }}
                        title="View details"
                      >
                        <EyeIcon className="h-5 w-5" />
                        <span>View Details</span>
                      </button>
                      
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <ProductViewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
        />
      </div>
    </div>
  );
};

export default Products;