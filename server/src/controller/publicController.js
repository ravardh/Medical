import ContactUs from "../models/contactModel.js";
import sendMail from "../utils/sendMail.js";
import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";

export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newContact = await ContactUs.create({
      name,
      email,
      subject,
      message,
    });

    // ✉️ Send Email to Admin
    await sendMail(
      "alvinwillcure@gmail.com", // Replace with your email
      `New Contact Request: ${subject}`, // Updated subject line
      `
            
            Contact Details:
            Name: ${name}
            Email: ${email} (Reply directly to this address)
            
            Message:
            "${message}"
            
            ---
            This message was sent via the contact form
              `.trim()
    );

    res.status(201).json({
      success: true,
      message: "Contact submitted successfully",
      contact: newContact,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all contact submissions
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactUs.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
      error: error.message,
    });
  }
};

// Update status of a contact submission
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "viewed"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const updatedContact = await ContactUs.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedContact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });
    }

    res.status(200).json({
      success: true,
      message: "Status updated",
      contact: updatedContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};

// Delete a contact submission by ID
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContact = await ContactUs.findByIdAndDelete(id);
    if (!deletedContact) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete contact",
      error: error.message,
    });
  }
};

// Add a review for a product
export const addReview = async (req, res) => {
  try {
    const { fullName, email, phone, product, rating, comment, userType } =
      req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !product ||
      !rating ||
      !comment ||
      !userType
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const newReview = await Review.create({
      fullName,
      email,
      phone,
      product,
      rating,
      comment,
      userType,
      isApproved: false,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get all reviews
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
