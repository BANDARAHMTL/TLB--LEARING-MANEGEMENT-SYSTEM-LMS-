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

// ─── Quiz ─────────────────────────────────────────────────────────────────────
const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'trueFalse'], required: true },
    options: [String],
    correctAnswer: { type: String, required: true },
    points: { type: Number, default: 1 },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: String,
    questions: [questionSchema],
    duration: { type: Number, default: 30 }, // in minutes
    passingScore: { type: Number, default: 60 }, // percentage
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalPoints: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);
quizSchema.pre('save', function (next) {
  this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
  next();
});
export const Quiz = mongoose.model('Quiz', quizSchema);

// ─── Quiz Submission ──────────────────────────────────────────────────────────
const quizSubmissionSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedAnswer: String,
      },
    ],
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    isPassed: { type: Boolean, default: false },
    submittedAt: { type: Date, default: Date.now },
    timeSpent: Number, // in seconds
  },
  { timestamps: true }
);
export const QuizSubmission = mongoose.model('QuizSubmission', quizSubmissionSchema);

// ─── Assignment ───────────────────────────────────────────────────────────────
const assignmentSubmissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submissionFile: String, // Cloudinary URL
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number, min: 0, max: 100 },
    feedback: String,
    isGraded: { type: Boolean, default: false },
    gradedAt: Date,
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructions: String,
    deadline: { type: Date, required: true },
    totalPoints: { type: Number, default: 100 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submissions: [assignmentSubmissionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
export const Assignment = mongoose.model('Assignment', assignmentSchema);

// ─── Course Material ──────────────────────────────────────────────────────────
const courseMaterialSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: String,
    fileUrl: { type: String, required: true }, // Cloudinary PDF URL
    fileName: String,
    fileSize: Number,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    section: String,
    isPublished: { type: Boolean, default: true },
    downloadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
export const CourseMaterial = mongoose.model('CourseMaterial', courseMaterialSchema);

// ─── Certificate ──────────────────────────────────────────────────────────
const certificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    certificateCode: { type: String, unique: true, required: true },
    certificateUrl: String,
    issuedDate: { type: Date, default: Date.now },
    completionDate: Date,
    score: Number,
  },
  { timestamps: true }
);
certificateSchema.pre('save', async function (next) {
  if (!this.certificateCode) {
    const code = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    this.certificateCode = code;
  }
  next();
});
export const Certificate = mongoose.model('Certificate', certificateSchema);

