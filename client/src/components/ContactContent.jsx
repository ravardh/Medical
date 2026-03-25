import React, { useEffect, useState } from 'react';
import axios from '../config/api.jsx';
import toast from "react-hot-toast";

const ContactContent = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/admin/contacts');
        setContacts(Array.isArray(res.data.contacts) ? res.data.contacts : []);
      } catch (err) {
        setError('Failed to fetch contact messages.');
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };
    window.scrollTo(0, 0);
    fetchContacts();
  }, []);

  // Filter contacts based on search term
  const filteredContacts = contacts.filter((contact) => {
    const term = searchTerm.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(term) ||
      contact.email?.toLowerCase().includes(term) ||
      contact.subject?.toLowerCase().includes(term) ||
      contact.message?.toLowerCase().includes(term) ||
      contact.status?.toLowerCase().includes(term)
    );
  });

  // Modal component for viewing contact message
  const ViewContactModal = ({ isOpen, onClose, contact }) => {
    if (!isOpen || !contact) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
          <h3 className="text-lg font-semibold mb-4">Contact Message</h3>
          <div className="mb-2">
            <span className="font-medium">Name:</span> {contact.name}
          </div>
          <div className="mb-2">
            <span className="font-medium">Email:</span> {contact.email}
          </div>
          <div className="mb-2">
            <span className="font-medium">Subject:</span> {contact.subject}
          </div>
          <div className="mb-2">
            <span className="font-medium">Status:</span> {contact.status}
          </div>
          <div className="mb-2">
            <span className="font-medium">Message:</span>
            <div className="mt-1 p-2 bg-gray-100 rounded text-gray-800 whitespace-pre-line">
              {contact.message}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleViewContact = async (contact) => {
    // Update status in UI
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c._id === contact._id ? { ...c, status: 'viewed' } : c
      )
    );
    setSelectedContact({ ...contact, status: 'viewed' });
    setIsModalOpen(true);
    // Update status in backend
    try {
      await axios.patch(`/admin/${contact._id}/status`, { status: 'viewed' });
    } catch (err) {
      // Optionally handle error (e.g., revert UI change or show a message)
      // For now, just log it
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteContact = async (id) => {
    toast((t) => (
      <span className="flex flex-col gap-2">
        <span>Are you sure you want to delete this image?</span>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.delete(`/admin/contact/${id}`);
                setContacts((prevContacts) => prevContacts.filter((c) => c._id !== id));
                toast.success("Contact message deleted successfully!");
              } catch (error) {
                toast.error("Failed to delete image");
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Contact Messages</h2>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <input
            type="search"
            placeholder="Search messages..."
            className="border rounded-md px-4 py-2 w-full sm:w-64"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-cyan-600 font-semibold">Loading...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 font-semibold">{error}</div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {filteredContacts.length === 0 ? (
                  <p className="text-center py-8 text-gray-400">No contact messages found.</p>
                ) : (
                  filteredContacts.map((contact) => (
                    <div key={contact._id} className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${contact.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                        </span>
                      </div>
                      {contact.subject && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{contact.subject}</p>
                      )}
                      <div className="flex gap-4 border-t pt-3">
                        <button className="text-cyan-600 hover:text-cyan-800 text-sm font-medium" onClick={() => handleViewContact(contact)}>View</button>
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium" onClick={() => handleDeleteContact(contact._id)}>Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <table className="hidden sm:table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-400">No contact messages found.</td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact) => (
                      <tr key={contact._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{contact.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{contact.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{contact.subject}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${contact.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="text-cyan-600 hover:text-cyan-800 mr-3"
                            onClick={() => handleViewContact(contact)}
                          >
                            View
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteContact(contact._id)}
                          >Delete</button>
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
      {/* Modal for viewing contact message */}
      <ViewContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contact={selectedContact}
      />
    </div>
  );
};

export default ContactContent;