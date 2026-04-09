import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: String,
  duration: Number, // in seconds
  isPreview: { type: Boolean, default: false },
  order: Number,
});

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  order: Number,
  lectures: [lectureSchema],
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    shortDescription: String,
    thumbnail: { type: String, required: true },
    previewVideo: String,
    price: { type: Number, required: true, default: 0 },
    discountPrice: Number,
    currency: { type: String, default: 'LKR' },
    language: { type: String, default: 'English' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'], default: 'All Levels' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sections: [sectionSchema],
    totalDuration: { type: Number, default: 0 },
    totalLectures: { type: Number, default: 0 },
    requirements: [String],
    whatYouLearn: [String],
    targetAudience: [String],
    tags: [String],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    enrolledStudents: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: true },
    certificate: { type: Boolean, default: true },
    batchSchedule: String, // e.g. "Weekend Batch Saturday 5.30"
    medium: { type: String, enum: ['English', 'Sinhala', 'Tamil'], default: 'English' },
  },
  { timestamps: true }
);

// Auto-generate slug
courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
  }
  next();
});

export default mongoose.model('Course', courseSchema);
