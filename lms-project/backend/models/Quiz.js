import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  type: { type: String, enum: ['mcq', 'trueFalse'], required: true },
  options: [{ type: String }], // For MCQ questions
  correctAnswer: { type: String, required: true },
  explanation: { type: String },
  points: { type: Number, default: 1 },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    questions: [questionSchema],
    passingScore: { type: Number, default: 50 },
    duration: { type: Number }, // Duration in minutes
    order: { type: Number },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Quiz', quizSchema);
