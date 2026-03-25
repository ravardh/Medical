import React from "react";

const ViewProductModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-4 px-4 sm:py-8">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto no-scrollbar pb-5">
        <div className="flex justify-between items-center mb-4 p-4 md:p-6 sticky top-0 bg-white border-b">
          <h3 className="text-lg md:text-xl font-semibold">View Product Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl md:text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 p-4 md:p-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Unique ID</p>
                <p className="text-gray-900">{product.uniqueId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Product Name</p>
                <p className="text-gray-900">{product.productName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Brand Name</p>
                <p className="text-gray-900">{product.brandName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">MRP</p>
                <p className="text-gray-900">₹{product.mrp}</p>
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Product Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Shelf Life</p>
                <p className="text-gray-900">{product.shelfLife} days</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Product Form</p>
                <p className="text-gray-900">{product.productForm}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Consume Type</p>
                <p className="text-gray-900">{product.consumeType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Key Ingredient</p>
                <p className="text-gray-900">{product.keyIngredient}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Strength</p>
                <p className="text-gray-900">{product.strength || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Flavour/Color</p>
                <p className="text-gray-900">{product.flavourColor || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Target Age</p>
                <p className="text-gray-900">{product.targetAge}</p>
              </div>
            </div>
          </div>

          {/* Physical Specifications */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Physical Specifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Product Weight</p>
                <p className="text-gray-900">{product.productWeight} g</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Packaging Dimensions</p>
                <p className="text-gray-900">
                  {product.packagingLength}" × {product.packagingBreadth}" × {product.packagingHeight}"
                </p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Product Details</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Uses</p>
                <p className="text-gray-900 text-sm">{product.uses}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Product Information</p>
                <p className="text-gray-900 text-sm">{product.productInformation}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Key Benefits</p>
                <p className="text-gray-900 text-sm">{product.keyBenefits}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Direction For Use</p>
                <p className="text-gray-900 text-sm">{product.directionForUse}</p>
              </div>
              {product.Tata1Mg && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Tata 1Mg Link</p>
                  <a 
                    href={product.Tata1Mg} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:text-cyan-800 text-sm break-all"
                  >
                    {product.Tata1Mg}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Product Status */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Product Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Featured</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  product.isfeatured 
                    ? 'bg-cyan-100 text-cyan-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {product.isfeatured ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Available</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  product.isAvailable 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.isAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Vegetarian</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  product.isVeg 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.isVeg ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Returnable</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  product.isReturnable 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {product.isReturnable ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Product Images */}
          {product.images?.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Product Images</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {product.images.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={img}
                      alt={`Product ${i + 1}`}
                      className="rounded-md w-full h-24 sm:h-32 object-cover border"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Timestamps</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Created At</p>
                <p className="text-gray-900 text-sm">
                  {new Date(product.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Last Updated</p>
                <p className="text-gray-900 text-sm">
                  {new Date(product.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;
