import asyncHandler from 'express-async-handler';
import { Quiz, QuizSubmission, Assignment, CourseMaterial, Progress } from '../models/index.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Get student's enrolled courses
// @route   GET /api/student/my-courses
export const getMyCourses = asyncHandler(async (req, res) => {
  const student = await User.findById(req.user._id)
    .populate('enrolledCourses', 'title slug thumbnail category price instructor');

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  res.json({
    courses: student.enrolledCourses || [],
    totalEnrolled: student.enrolledCourses?.length || 0,
  });
});

// @desc    Get course progress for student
// @route   GET /api/student/courses/:courseId/progress
export const getCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const progress = await Progress.findOne({
    user: req.user._id,
    course: courseId,
  });

  if (!progress) {
    res.status(404);
    throw new Error('Progress not found');
  }

  res.json(progress);
});

// @desc    Get course materials for download
// @route   GET /api/student/courses/:courseId/materials
export const getCourseMaterials = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Check if student is enrolled in course
  const student = await User.findById(req.user._id);
  if (!student?.enrolledCourses?.includes(courseId)) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  const materials = await CourseMaterial.find({
    course: courseId,
    isPublished: true,
  }).select('-fileSize');

  res.json(materials);
});

// @desc    Download material file
// @route   GET /api/student/materials/:materialId/download
export const downloadMaterial = asyncHandler(async (req, res) => {
  const { materialId } = req.params;

  const material = await CourseMaterial.findById(materialId);

  if (!material) {
    res.status(404);
    throw new Error('Material not found');
  }

  // Check enrollment
  const student = await User.findById(req.user._id);
  if (!student?.enrolledCourses?.includes(material.course)) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  // Increment download count
  material.downloadCount = (material.downloadCount || 0) + 1;
  await material.save();

  res.json({
    fileUrl: material.fileUrl,
    title: material.title,
    fileName: material.fileName,
  });
});

// @desc    Get quizzes for a course
// @route   GET /api/student/courses/:courseId/quizzes
export const getCourseQuizzes = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Check enrollment
  const student = await User.findById(req.user._id);
  if (!student?.enrolledCourses?.includes(courseId)) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  const quizzes = await Quiz.find({
    course: courseId,
    isPublished: true,
  }).select('-questions');

  // Get student's quiz submissions
  const submissions = await QuizSubmission.find({
    student: req.user._id,
    quiz: { $in: quizzes.map(q => q._id) },
  });

  const quizzesWithSubmissions = quizzes.map(quiz => {
    const submission = submissions.find(s => s.quiz.toString() === quiz._id.toString());
    return {
      ...quiz.toObject(),
      submitted: !!submission,
      lastScore: submission?.score,
      isPassed: submission?.isPassed,
    };
  });

  res.json(quizzesWithSubmissions);
});

// @desc    Get quiz details (for taking quiz)
// @route   GET /api/student/quizzes/:quizId
export const getQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId).populate('course', 'title');

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  // Check enrollment
  const student = await User.findById(req.user._id);
  if (!student?.enrolledCourses?.includes(quiz.course._id)) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  // Check if already submitted
  const previousSubmission = await QuizSubmission.findOne({
    quiz: quizId,
    student: req.user._id,
  });

  // Return quiz without showing correct answers initially
  const quizData = {
    _id: quiz._id,
    title: quiz.title,
    description: quiz.description,
    duration: quiz.duration,
    totalPoints: quiz.totalPoints,
    passingScore: quiz.passingScore,
    questions: quiz.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
      points: q.points,
    })),
    previousScore: previousSubmission?.score,
    alreadySubmitted: !!previousSubmission,
  };

  res.json(quizData);
});

// @desc    Submit quiz answers
// @route   POST /api/student/quizzes/:quizId/submit
export const submitQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { answers, timeSpent } = req.body;

  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  // Calculate score
  let score = 0;
  const evaluatedAnswers = answers.map(answer => {
    const question = quiz.questions.id(answer.questionId);
    if (question && question.correctAnswer === answer.selectedAnswer) {
      score += question.points || 1;
    }
    return answer;
  });

  const percentage = (score / quiz.totalPoints) * 100;
  const isPassed = percentage >= quiz.passingScore;

  // Create submission record
  const submission = await QuizSubmission.create({
    quiz: quizId,
    student: req.user._id,
    answers: evaluatedAnswers,
    score,
    percentage: Math.round(percentage),
    isPassed,
    timeSpent,
  });

  res.status(201).json({
    _id: submission._id,
    score: submission.score,
    percentage: submission.percentage,
    isPassed: submission.isPassed,
    totalPoints: quiz.totalPoints,
    passingScore: quiz.passingScore,
    feedback: isPassed ? 'Congratulations! You passed the quiz.' : 'You did not pass this time. Please try again.',
  });
});

// @desc    Get quiz result/score
// @route   GET /api/student/quizzes/:quizId/result
export const getQuizResult = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId);
  const submission = await QuizSubmission.findOne({
    quiz: quizId,
    student: req.user._id,
  });

  if (!submission) {
    res.status(404);
    throw new Error('No submission found for this quiz');
  }

  // Return detailed result with correct answers
  const detailedResult = {
    submission: submission,
    quiz: {
      title: quiz.title,
      totalPoints: quiz.totalPoints,
      passingScore: quiz.passingScore,
    },
    questions: quiz.questions.map(q => {
      const studentAnswer = submission.answers.find(a => a.questionId.toString() === q._id.toString());
      return {
        _id: q._id,
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        studentAnswer: studentAnswer?.selectedAnswer,
        isCorrect: studentAnswer?.selectedAnswer === q.correctAnswer,
        points: q.points,
      };
    }),
  };

  res.json(detailedResult);
});

// @desc    Get assignments for a course
// @route   GET /api/student/courses/:courseId/assignments
export const getCourseAssignments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  // Check enrollment
  const student = await User.findById(req.user._id);
  if (!student?.enrolledCourses?.includes(courseId)) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  const assignments = await Assignment.find({
    course: courseId,
    isActive: true,
  }).select('_id title description deadline totalPoints');

  // Get student's submissions
  const assignmentsWithSubmissions = assignments.map(assignment => {
    const submission = assignment.submissions?.find(
      s => s.student.toString() === req.user._id.toString()
    );
    return {
      ...assignment.toObject(),
      submitted: !!submission,
      grade: submission?.grade,
      isGraded: submission?.isGraded,
      feedback: submission?.feedback,
      submittedAt: submission?.submittedAt,
    };
  });

  res.json(assignmentsWithSubmissions);
});

// @desc    Get assignment details
// @route   GET /api/student/assignments/:assignmentId
export const getAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Check enrollment
  const student = await User.findById(req.user._id);
  if (!student?.enrolledCourses?.includes(assignment.course)) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  const submission = assignment.submissions?.find(
    s => s.student.toString() === req.user._id.toString()
  );

  res.json({
    ...assignment.toObject(),
    submission: submission || null,
    isOverdue: new Date() > assignment.deadline,
  });
});

// @desc    Submit assignment
// @route   POST /api/student/assignments/:assignmentId/submit
export const submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { submissionFile } = req.body; // Assuming file URL is passed from middleware

  const assignment = await Assignment.findById(assignmentId);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // Check enrollment
  const student = await User.findById(req.user._id);
  if (!student?.enrolledCourses?.includes(assignment.course)) {
    res.status(403);
    throw new Error('You are not enrolled in this course');
  }

  // Check if already submitted
  const existingSubmission = assignment.submissions?.find(
    s => s.student.toString() === req.user._id.toString()
  );

  if (existingSubmission) {
    res.status(400);
    throw new Error('You have already submitted this assignment. Contact instructor to update.');
  }

  // Add submission
  assignment.submissions.push({
    student: req.user._id,
    submissionFile,
    submittedAt: new Date(),
  });

  await assignment.save();

  res.status(201).json({
    message: 'Assignment submitted successfully',
    assignment: assignment,
  });
});

// @desc    Get all student submissions
// @route   GET /api/student/my-submissions
export const getMySubmissions = asyncHandler(async (req, res) => {
  const quizSubmissions = await QuizSubmission.find({
    student: req.user._id,
  })
    .populate('quiz', 'title course')
    .sort({ submittedAt: -1 });

  const assignments = await Assignment.find({
    'submissions.student': req.user._id,
  }).select('_id title course submissions');

  const assignmentSubmissions = assignments.map(assignment => {
    const submission = assignment.submissions.find(
      s => s.student.toString() === req.user._id.toString()
    );
    return {
      type: 'assignment',
      _id: assignment._id,
      title: assignment.title,
      course: assignment.course,
      submittedAt: submission?.submittedAt,
      grade: submission?.grade,
      isGraded: submission?.isGraded,
      feedback: submission?.feedback,
    };
  });

  res.json({
    quizzes: quizSubmissions.map(q => ({
      type: 'quiz',
      ...q.toObject(),
    })),
    assignments: assignmentSubmissions,
    total: quizSubmissions.length + assignmentSubmissions.length,
  });
});
