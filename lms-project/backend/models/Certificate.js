import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    certificateCode: { type: String, unique: true, required: true },
    certificateUrl: { type: String },
    issuedDate: { type: Date, default: Date.now },
    completionDate: { type: Date },
    score: { type: Number },
  },
  { timestamps: true }
);

// Generate unique certificate code before saving
certificateSchema.pre('save', async function (next) {
  if (!this.certificateCode) {
    const code = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    this.certificateCode = code;
  }
  next();
});

export default mongoose.model('Certificate', certificateSchema);
