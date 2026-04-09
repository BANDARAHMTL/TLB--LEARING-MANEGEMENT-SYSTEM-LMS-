import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    instructions: { type: String },
    dueDate: { type: Date, required: true },
    totalPoints: { type: Number, default: 100 },
    attachments: [{ type: String }], // URLs of attachment files
    allowedFileTypes: { type: [String], default: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'png'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false },
    order: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
