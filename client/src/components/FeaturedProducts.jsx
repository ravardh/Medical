import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from '../config/api'
import ViewProductModal from './modals/ViewProductModal'
import ProductViewModal from './modals/ProductViewModal'

const FeaturedProducts = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/public/getAllProducts');
        const all = Array.isArray(res.data) ? res.data : [];
        setFeatured(all.filter(p => p.isfeatured));
      } catch (err) {
        setFeatured([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleLearnMore = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#325946] mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover our most popular healthcare products, trusted by medical professionals and patients.</p>
        </div>

        {loading ? (
          <div className="text-center text-cyan-600 py-12 text-lg font-semibold">Loading...</div>
        ) : featured.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-lg">No featured products found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map(product => (
              <div key={product._id} className="bg-gray-100 rounded-xl shadow-md overflow-hidden hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-300">
                <div className="aspect-[4/3] bg-white flex items-center justify-center">
                  <img src={product.images?.[0] || '/placeholder-product.png'} alt={product.productName} className="w-full h-full object-contain p-6" />
                </div>
                <div className="p-6">
                  <span className="text-sm text-[#a1cc59] font-medium">{product.brandName}</span>
                  <h3 className="text-xl font-semibold text-[#325946] mt-2">{product.productName}</h3>
                  <p className="text-gray-600 mt-2 line-clamp-2">{product.productInformation || 'No description available.'}</p>
                  <button
                    onClick={() => handleLearnMore(product)}
                    className="inline-block mt-4 text-[#325946] font-medium hover:text-[#a1cc59] transition-colors"
                  >
                    Learn More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <ProductViewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={selectedProduct}
        />
      </div>
    </section>
  )
}

export default FeaturedProducts