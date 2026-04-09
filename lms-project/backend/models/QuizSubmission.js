import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedAnswer: { type: String },
  isCorrect: { type: Boolean },
});

const quizSubmissionSchema = new mongoose.Schema(
  {
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    isPassed: { type: Boolean, default: false },
    attemptedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('QuizSubmission', quizSubmissionSchema);
