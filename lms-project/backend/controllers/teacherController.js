import asyncHandler from 'express-async-handler';
import { Quiz, QuizSubmission, Assignment, CourseMaterial, Certificate } from '../models/index.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// ═══════════════════════════════════════════════════════════════════════════════
// ✏️  MATERIAL MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

// @desc    Upload course material (PDF)
// @route   POST /api/teacher/materials
export const uploadMaterial = asyncHandler(async (req, res) => {
  const { courseId, title, description, fileUrl, sectionId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to upload material for this course');
  }

  const material = await CourseMaterial.create({
    course: courseId,
    title,
    description,
    fileUrl,
    sectionId,
    uploadedBy: req.user._id,
  });

  res.status(201).json(material);
});

// @desc    Get course materials
// @route   GET /api/teacher/materials/:courseId
export const getCourseMaterials = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const materials = await CourseMaterial.find({ course: courseId })
    .sort({ createdAt: -1 });

  res.json(materials);
});

// @desc    Delete material
// @route   DELETE /api/teacher/materials/:materialId
export const deleteMaterial = asyncHandler(async (req, res) => {
  const { materialId } = req.params;

  const material = await CourseMaterial.findById(materialId);
  if (!material) {
    res.status(404);
    throw new Error('Material not found');
  }

  const course = await Course.findById(material.course);
  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this material');
  }

  await CourseMaterial.findByIdAndDelete(materialId);
  res.json({ message: 'Material deleted successfully' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ❓ QUIZ MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

// @desc    Create quiz
// @route   POST /api/teacher/quizzes
export const createQuiz = asyncHandler(async (req, res) => {
  const { courseId, title, description, questions, passingScore, duration } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to create quiz for this course');
  }

  const quiz = await Quiz.create({
    course: courseId,
    title,
    description,
    questions,
    passingScore,
    duration,
    createdBy: req.user._id,
  });

  res.status(201).json(quiz);
});

// @desc    Get course quizzes
// @route   GET /api/teacher/quizzes/:courseId
export const getCourseQuizzes = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const quizzes = await Quiz.find({ course: courseId }).populate('createdBy', 'name email');

  res.json(quizzes);
});

// @desc    Get single quiz
// @route   GET /api/teacher/quizzes/:quizId/details
export const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId).populate('createdBy', 'name email');

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  res.json(quiz);
});

// @desc    Update quiz
// @route   PUT /api/teacher/quizzes/:quizId
export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  const course = await Course.findById(quiz.course);
  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this quiz');
  }

  Object.assign(quiz, req.body);
  await quiz.save();

  res.json(quiz);
});

// @desc    Delete quiz
// @route   DELETE /api/teacher/quizzes/:quizId
export const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  const course = await Course.findById(quiz.course);
  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this quiz');
  }

  await Quiz.findByIdAndDelete(req.params.quizId);
  res.json({ message: 'Quiz deleted successfully' });
});

// @desc    Get quiz submissions
// @route   GET /api/teacher/quizzes/:quizId/submissions
export const getQuizSubmissions = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const submissions = await QuizSubmission.find({ quiz: quizId })
    .populate('student', 'name email')
    .sort({ submittedAt: -1 });

  res.json(submissions);
});

// ═══════════════════════════════════════════════════════════════════════════════
// ✍️  ASSIGNMENT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

// @desc    Create assignment
// @route   POST /api/teacher/assignments
export const createAssignment = asyncHandler(async (req, res) => {
  const { courseId, title, description, instructions, deadline, totalPoints } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to create assignment for this course');
  }

  const assignment = await Assignment.create({
    course: courseId,
    title,
    description,
    instructions,
    deadline,
    totalPoints,
    createdBy: req.user._id,
  });

  res.status(201).json(assignment);
});

// @desc    Get course assignments
// @route   GET /api/teacher/assignments/:courseId
export const getCourseAssignments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const assignments = await Assignment.find({ course: courseId })
    .populate('createdBy', 'name email');

  res.json(assignments);
});

// @desc    Get single assignment
// @route   GET /api/teacher/assignments/:assignmentId/details
export const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId).populate('createdBy', 'name email');

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  res.json(assignment);
});

// @desc    Update assignment
// @route   PUT /api/teacher/assignments/:assignmentId
export const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  const course = await Course.findById(assignment.course);
  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this assignment');
  }

  Object.assign(assignment, req.body);
  await assignment.save();

  res.json(assignment);
});

// @desc    Delete assignment
// @route   DELETE /api/teacher/assignments/:assignmentId
export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  const course = await Course.findById(assignment.course);
  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this assignment');
  }

  await Assignment.findByIdAndDelete(req.params.assignmentId);
  res.json({ message: 'Assignment deleted successfully' });
});

// @desc    Get assignment submissions for grading
// @route   GET /api/teacher/assignments/:assignmentId/submissions
export const getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  const assignment = await Assignment.findById(assignmentId).populate({
    path: 'submissions.student',
    select: 'name email',
  });

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  res.json(assignment.submissions);
});

// @desc    Grade assignment submission
// @route   PUT /api/teacher/assignments/:assignmentId/submissions/:submissionId
export const gradeSubmission = asyncHandler(async (req, res) => {
  const { assignmentId, submissionId } = req.params;
  const { grade, feedback } = req.body;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  const course = await Course.findById(assignment.course);
  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to grade this submission');
  }

  const submission = assignment.submissions.id(submissionId);
  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  submission.grade = grade;
  submission.feedback = feedback;
  submission.isGraded = true;
  submission.gradedAt = new Date();
  submission.gradedBy = req.user._id;

  await assignment.save();

  res.json(submission);
});

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 TEACHER DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

// @desc    Get teacher dashboard stats
// @route   GET /api/teacher/dashboard
export const getTeacherDashboard = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id });
  const totalStudents = courses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0);

  const quizzes = await Quiz.find({ createdBy: req.user._id });
  const assignments = await Assignment.find({ createdBy: req.user._id });

  res.json({
    totalCourses: courses.length,
    totalStudents,
    totalQuizzes: quizzes.length,
    totalAssignments: assignments.length,
    courses: courses.map((c) => ({
      _id: c._id,
      title: c.title,
      enrolledStudents: c.enrolledStudents,
      rating: c.rating,
    })),
  });
});

// @desc    Get teacher's courses
// @route   GET /api/teacher/courses
export const getTeacherCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id });

  res.json(courses);
});
