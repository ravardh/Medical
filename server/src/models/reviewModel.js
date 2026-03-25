import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;