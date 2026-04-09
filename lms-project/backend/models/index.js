import mongoose from 'mongoose';

// ─── Category ───────────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    icon: String,
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    description: String,
  },
  { timestamps: true }
);
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});
export const Category = mongoose.model('Category', categorySchema);

// ─── Order ───────────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        price: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'LKR' },
    paymentMethod: { type: String, enum: ['stripe', 'wallet', 'free'], default: 'stripe' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    stripePaymentIntentId: String,
    couponCode: String,
    discount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export const Order = mongoose.model('Order', orderSchema);

// ─── Review ──────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);
reviewSchema.index({ user: 1, course: 1 }, { unique: true });
export const Review = mongoose.model('Review', reviewSchema);

// ─── Progress ────────────────────────────────────────────────────────────────
const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completedLectures: [{ type: mongoose.Schema.Types.ObjectId }],
    lastWatched: { type: mongoose.Schema.Types.ObjectId },
    completionPercentage: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    certificateIssued: { type: Boolean, default: false },
  },
  { timestamps: true }
);
export const Progress = mongoose.model('Progress', progressSchema);
