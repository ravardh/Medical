import express from "express";
import {
  createContact,
  getAllReviews,
  getProductReviews,
  addReview,
  getProductById,
} from "../../src/controller/publicController.js";
import {
  getAllProducts,
  getAllSliderImages,

} from "../../src/controller/adminController.js";

const router = express.Router();

// POST /api/contact - Submit contact form
router.post("/create", createContact);
router.get("/getAllProducts", getAllProducts);
router.get("/getProductById/:id", getProductById); 

// GET /api/slider - Get all images
router.get("/slider", getAllSliderImages);

// GET /api/review - Get all reviews
router.get("/review", getAllReviews);

router.post("/review", addReview); // Assuming createContact is used for adding reviews

router.get("/review/:productId", getProductReviews);

export default router;
