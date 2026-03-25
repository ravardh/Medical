import React, { useState } from "react";
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
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { FaCheckDouble } from "react-icons/fa6";
import { motion } from "framer-motion";

const ProductViewModal = ({ isOpen, onClose, product }) => {
  // Always call hooks first
  const [selectedImage, setSelectedImage] = useState(
    product?.images?.[0] || "/placeholder-product.png"
  );

  React.useEffect(() => {
    setSelectedImage(product?.images?.[0] || "/placeholder-product.png");
  }, [product]);

  // Only return null after hooks
  if (!isOpen || !product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed top-16 left-0 right-0 bottom-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto py-4 px-4 sm:py-8"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-y-auto md:overflow-hidden shadow-2xl flex flex-col mt-10"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-gray-800">Product Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-full">
          <div className="md:w-2/5 bg-gradient-to-b from-gray-50 to-white p-4 flex flex-col items-center">
            <div className="w-55 h-55 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden mb-2">
              <img
                src={selectedImage}
                alt={product.productName}
                className="w-full h-full object-contain"
              />
            </div>
            {/* Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mb-2">
                {product.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`w-10 h-10 object-contain rounded border cursor-pointer transition-all duration-200 ${
                      selectedImage === img
                        ? "border-cyan-600 ring-2 ring-cyan-200"
                        : "border-gray-200"
                    }`}
                    onClick={() => setSelectedImage(img)}
                  />
                ))}
              </div>
            )}
            <div className="text-center space-y-2">
              <div className="text-2xl font-bold text-cyan-700 flex items-center justify-center gap-2">
                <CurrencyRupeeIcon className="h-6 w-6" />
                {product.mrp}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                <TagIcon className="h-4 w-4" />
                {product.brandName}
              </div>
            </div>

            <button className="mt-2 w-full bg-gradient-to-r to-[#a1cc59] from-[#0ba159] text-white px-6 py-2 rounded-lg hover:opacity-80 font-semibold shadow-md flex items-center justify-center gap-2 transition-all">
              {product.Tata1Mg && (
                <div>
                  <a
                    href={product.Tata1Mg}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium"
                  >
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    Buy on Tata 1Mg
                  </a>
                </div>
              )}
            </button>
            <button className="mt-2 w-full bg-gradient-to-r to-[#a1cc59] from-[#0ba159] text-white px-6 py-2 rounded-lg hover:opacity-80 font-semibold shadow-md flex items-center justify-center gap-2 transition-all">
              <div>
                <a
                  href={"/contact"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium"
                >
                  <ShoppingBagIcon className="h-4 w-4" />
                  Contact us for Bulk Orders
                </a>
              </div>
            </button>
          </div>
          <div
            className="md:w-3/5 p-6 custom-scrollbar md:overflow-y-auto"
            style={{ maxHeight: 'calc(80vh - 64px)' }}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              {product.productName}
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <CakeIcon className="h-5 w-5 text-pink-400" />
                  <span className="font-medium">Shelf Life</span>
                </div>
                <div className="text-sm text-gray-600">
                  {product.shelfLife} days
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <BeakerIcon className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Form</span>
                </div>
                <div className="text-sm text-gray-600">
                  {product.productForm}
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <UserIcon className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">Target Age</span>
                </div>
                <div className="text-sm text-gray-600">
                  {product.targetAge}
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <InformationCircleIcon className="h-5 w-5 text-cyan-500" />
                  <span className="font-medium">Consume Type</span>
                </div>
                <div className="text-sm text-gray-600">
                  {product.consumeType}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-lg">
                  <FaCheckDouble className="h-5 w-5 text-cyan-600" />
                  Uses
                </h4>
                {product.uses ? (
                  <ul className="list-unstyled pl-5 text-gray-700 text-sm leading-relaxed">
                    {product.uses
                      .split("\n")
                      .map((line, idx) =>
                        line.trim() ? <li key={idx}>{line}</li> : null
                      )}
                  </ul>
                ) : (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    No description available.
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-lg">
                  <InformationCircleIcon className="h-5 w-5 text-cyan-600" />
                  Description
                </h4>
                {product.productInformation ? (
                  <ul className="list-unstyled pl-5 text-gray-700 text-sm leading-relaxed">
                    {product.productInformation
                      .split("\n")
                      .map((line, idx) =>
                        line.trim() ? <li key={idx}>{line}</li> : null
                      )}
                  </ul>
                ) : (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    No description available.
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-lg">
                  <ClipboardDocumentCheckIcon className="h-5 w-5 text-cyan-600" />
                  Key Benefits
                </h4>
                {product.keyBenefits ? (
                  <ul className="list-unstyled pl-5 text-gray-700 text-sm leading-relaxed">
                    {product.keyBenefits
                      .split("\n")
                      .map((line, idx) =>
                        line.trim() ? <li key={idx}>{line}</li> : null
                      )}
                  </ul>
                ) : (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    No benefits information available.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductViewModal;
