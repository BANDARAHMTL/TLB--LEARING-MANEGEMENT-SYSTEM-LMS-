import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// ════════════════════════════════════════
// USER MODEL
// ════════════════════════════════════════
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  notifications: [{
    message: String,
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    isRead: { type: Boolean, default: false },
    link: String,
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matchPassword = async function (pwd) {
  return bcrypt.compare(pwd, this.password);
};
export const User = mongoose.model('User', userSchema);

// ════════════════════════════════════════
// CATEGORY MODEL
// ════════════════════════════════════════
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true },
  description: String,
  icon: String,
  color: { type: String, default: '#6366f1' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

categorySchema.pre('save', function (next) {
  if (this.isModified('name'))
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  next();
});
export const Category = mongoose.model('Category', categorySchema);

// ════════════════════════════════════════
// COURSE MODEL
// ════════════════════════════════════════
const materialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'video', 'link', 'text'], required: true },
  url: String,
  fileSize: Number,
  duration: Number,
  order: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: false },
}, { timestamps: true });

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  order: { type: Number, default: 0 },
  materials: [materialSchema],
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  thumbnail: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number, default: 0 },
  discountPrice: Number,
  currency: { type: String, default: 'USD' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'All Levels' },
  language: { type: String, default: 'English' },
  sections: [sectionSchema],
  tags: [String],
  requirements: [String],
  whatYouLearn: [String],
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  enrolledCount: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
  certificate: { type: Boolean, default: true },
}, { timestamps: true });

courseSchema.pre('save', function (next) {
  if (this.isModified('title'))
    this.slug = `${this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
  next();
});
export const Course = mongoose.model('Course', courseSchema);

// ════════════════════════════════════════
// ENROLLMENT MODEL
// ════════════════════════════════════════
const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  status: { type: String, enum: ['active', 'completed', 'dropped', 'pending'], default: 'active' },
  paymentStatus: { type: String, enum: ['free', 'paid', 'pending', 'refunded'], default: 'free' },
  amountPaid: { type: Number, default: 0 },
  paymentMethod: String,
  transactionId: String,
  completedMaterials: [{ type: mongoose.Schema.Types.ObjectId }],
  progressPercent: { type: Number, default: 0 },
  completedAt: Date,
  certificateIssued: { type: Boolean, default: false },
  lastAccessed: { type: Date, default: Date.now },
}, { timestamps: true });

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
export const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

// ════════════════════════════════════════
// QUIZ MODEL
// ════════════════════════════════════════
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'short_answer', 'true_false'], required: true },
  options: [{ text: String, isCorrect: Boolean }],
  correctAnswer: String, // for short_answer
  points: { type: Number, default: 1 },
  explanation: String,
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [questionSchema],
  timeLimit: { type: Number, default: 0 }, // minutes, 0 = no limit
  passingScore: { type: Number, default: 60 }, // percent
  maxAttempts: { type: Number, default: 3 },
  isPublished: { type: Boolean, default: false },
  shuffleQuestions: { type: Boolean, default: false },
  showResults: { type: Boolean, default: true },
  dueDate: Date,
}, { timestamps: true });
export const Quiz = mongoose.model('Quiz', quizSchema);

// ════════════════════════════════════════
// QUIZ ATTEMPT MODEL
// ════════════════════════════════════════
const attemptSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{
    question: mongoose.Schema.Types.ObjectId,
    selectedOption: mongoose.Schema.Types.ObjectId,
    textAnswer: String,
    isCorrect: Boolean,
    pointsEarned: Number,
  }],
  score: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  timeTaken: Number, // seconds
  attemptNumber: { type: Number, default: 1 },
}, { timestamps: true });
export const QuizAttempt = mongoose.model('QuizAttempt', attemptSchema);

// ════════════════════════════════════════
// ASSIGNMENT MODEL
// ════════════════════════════════════════
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dueDate: { type: Date, required: true },
  maxPoints: { type: Number, default: 100 },
  allowedFileTypes: { type: [String], default: ['pdf', 'doc', 'docx'] },
  maxFileSize: { type: Number, default: 10 }, // MB
  isPublished: { type: Boolean, default: false },
  attachments: [{ name: String, url: String, type: String }],
}, { timestamps: true });
export const Assignment = mongoose.model('Assignment', assignmentSchema);

// ════════════════════════════════════════
// SUBMISSION MODEL
// ════════════════════════════════════════
const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  files: [{ name: String, url: String, size: Number, type: String }],
  comments: String,
  grade: Number,
  feedback: String,
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  gradedAt: Date,
  status: { type: String, enum: ['submitted', 'graded', 'returned', 'late'], default: 'submitted' },
  isLate: { type: Boolean, default: false },
}, { timestamps: true });

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
export const Submission = mongoose.model('Submission', submissionSchema);

// ════════════════════════════════════════
// REVIEW MODEL
// ════════════════════════════════════════
const reviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
}, { timestamps: true });
reviewSchema.index({ course: 1, student: 1 }, { unique: true });
export const Review = mongoose.model('Review', reviewSchema);
