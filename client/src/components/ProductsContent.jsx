import React, { useState, useEffect } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import AddProductModal from "./modals/AddProductModal";
import ViewProductModal from "./modals/ViewProductModal";
import EditProductModal from "./modals/EditProductModal";

const ProductsContent = () => {
  window.scrollTo(0, 0);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/products");

      setProducts(Array.isArray(res.data) ? res.data : []);
      //toast.success("All Products Fetched");
    } catch (err) {
      console.error("Error fetching products:", err);
      console.error("Error response:", err.response?.data); // Debug log
      toast.error("Failed to fetch products");
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (productId) => {
    toast((t) => (
      <span className="flex flex-col gap-2">
        <span>Are you sure you want to delete?</span>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.delete(`/admin/products/${productId}`, {
                  withCredentials: true
                });
                setProducts((prev) => prev.filter((p) => p._id !== productId));
                toast.success("Product deleted successfully");
              } catch (error) {
                toast.error("Failed to delete product");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Products Management
      </h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between mb-6 flex-wrap gap-3">
          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700"
          >
            Add New Product
          </button>
          <input
            type="search"
            placeholder="Search products..."
            className="border rounded-md px-4 py-2 w-full sm:w-64"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {(!products || products.length === 0) ? (
            <p className="text-center py-8 text-gray-500">No products found</p>
          ) : (
            (Array.isArray(products) ? products : [])
              .filter(product =>
                product.productName?.toLowerCase().includes(search.toLowerCase()) ||
                product.brandName?.toLowerCase().includes(search.toLowerCase())
              )
              .map((product) => (
                <div key={product._id} className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
                  <div className="mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{product.productName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">ID: {product.uniqueId}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${product.isfeatured ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-700'}`}>
                      {product.isfeatured ? 'Featured' : 'Not Featured'}
                    </span>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${product.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.isAvailable ? 'Available' : 'Not Available'}
                    </span>
                  </div>
                  <div className="flex gap-4 border-t pt-3">
                    <button onClick={() => { setSelectedProduct(product); setIsViewModalOpen(true); }} className="text-cyan-600 hover:text-cyan-800 text-sm font-medium">View</button>
                    <button onClick={() => { setSelectedProduct(product); setIsEditModalOpen(true); }} className="text-cyan-600 hover:text-cyan-800 text-sm font-medium">Edit</button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium" onClick={() => handleDelete(product._id)}>Delete</button>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Unique ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Is Featured
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Is Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(!products || products.length === 0) ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                (Array.isArray(products) ? products : [])
                  .filter(product =>
                    product.productName?.toLowerCase().includes(search.toLowerCase()) ||
                    product.brandName?.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((product) => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">{product.uniqueId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{product.productName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${product.isfeatured
                            ? 'bg-cyan-100 text-cyan-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}>
                          {product.isfeatured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${product.isAvailable
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                          {product.isAvailable ? 'Available' : 'Not Available'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsViewModalOpen(true);
                          }}
                          className="text-cyan-600 hover:text-cyan-800 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setIsEditModalOpen(true);
                          }}
                          className="text-cyan-600 hover:text-cyan-800 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(product._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddProductModal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        onProductAdded={fetchProducts}
      />
      <ViewProductModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={selectedProduct}
      />
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={selectedProduct}
        onProductUpdated={fetchProducts}
      />
    </div>
  );
};

export default ProductsContent;
