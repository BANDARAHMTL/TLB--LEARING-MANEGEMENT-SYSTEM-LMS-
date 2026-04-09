import mongoose from 'mongoose';

const courseMaterialSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: 'pdf' }, // pdf, document, resource, image, video
    fileSize: { type: Number }, // in bytes
    sectionId: { type: Number }, // Reference to section order/index
    order: { type: Number },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    downloads: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('CourseMaterial', courseMaterialSchema);
