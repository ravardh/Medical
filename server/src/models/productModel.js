import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    uniqueId: {
      type: String,
      required: true,
      unique: true,
    },
    productName: {
      type: String,
      required: true,
    },
    brandName: {
      type: String,
      required: true,
    },

    // Pricing Information
    mrp: {
      type: Number,
      required: true,
    },

    // Product Specifications
    shelfLife: {
      type: Number,
      required: true,
    }, // in days
    productForm: {
      type: String,
      required: true,
    },
    consumeType: {
      type: String,
      required: true,
    },
    isVeg: {
      type: Boolean,
      required: true,
    },
    keyIngredient: {
      type: String,
      required: true,
    },
    strength: {
      type: String,
    },
    flavourColor: {
      type: String,
    },
    isReturnable: {
      type: Boolean,
      required: true,
    },

    // Physical Specifications
    productWeight: {
      type: Number,
      required: true,
    },
    packagingLength: {
      type: Number,
      required: true,
    }, // in inches
    packagingBreadth: {
      type: Number,
      required: true,
    }, // in inches
    packagingHeight: {
      type: Number,
      required: true,
    }, // in inches

    // Usage and Target Information
    uses: {
      type: String,
      required: true,
    },
    targetAge: {
      type: String,
      required: true,
      enum: ["Child", "Elderly", "All"],
    },

    // Product Details
    images: {
      type: [String],
      required: true,
    },
    productInformation: {
      type: String,
      required: true,
    },
    Tata1Mg: {
      type: String,
    },
    keyBenefits: {
      type: String,
      required: true,
    },
    directionForUse: {
      type: String,
      required: true,
    },
    isfeatured: {
      type: Boolean,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
