import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    submissionUrl: [{ type: String }], // Array of file URLs
    submittedAt: { type: Date, default: Date.now },
    isLate: { type: Boolean, default: false },
    grade: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    gradedAt: { type: Date },
    status: { type: String, enum: ['pending', 'submitted', 'graded'], default: 'submitted' },
  },
  { timestamps: true }
);

export default mongoose.model('Submission', submissionSchema);
