import asyncHandler from 'express-async-handler';
import { Enrollment, Course, Quiz, QuizAttempt, Assignment, Submission, Category, User, Review } from '../models/index.js';
import { sendSuccess } from '../utils/helpers.js';

// ── ENROLLMENTS ─────────────────────────────────────────
export const enrollCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  const existing = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (existing) { res.status(400); throw new Error('Already enrolled'); }
  const enrollment = await Enrollment.create({
    student: req.user._id, course: courseId,
    paymentStatus: course.price === 0 ? 'free' : 'pending',
    amountPaid: course.price === 0 ? 0 : course.price,
  });
  await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });
  sendSuccess(res, enrollment, 'Enrolled successfully', 201);
});

export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({ path: 'course', populate: [{ path: 'category', select: 'name color' }, { path: 'teacher', select: 'name avatar' }] })
    .sort({ lastAccessed: -1 });
  sendSuccess(res, enrollments);
});

export const getAllEnrollments = asyncHandler(async (req, res) => {
  const { courseId, studentId, page = 1, limit = 20 } = req.query;
  const query = {};
  if (courseId) query.course = courseId;
  if (studentId) query.student = studentId;
  if (req.user.role === 'teacher') {
    const myCourses = await Course.find({ teacher: req.user._id }).select('_id');
    query.course = { $in: myCourses.map(c => c._id) };
  }
  const total = await Enrollment.countDocuments(query);
  const enrollments = await Enrollment.find(query)
    .populate('student', 'name email avatar')
    .populate('course', 'title thumbnail price')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit).limit(Number(limit));
  sendSuccess(res, { enrollments, total, page: Number(page), pages: Math.ceil(total / limit) });
});

export const updateProgress = asyncHandler(async (req, res) => {
  const { courseId, materialId } = req.body;
  const enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (!enrollment) { res.status(404); throw new Error('Not enrolled'); }
  if (!enrollment.completedMaterials.includes(materialId)) {
    enrollment.completedMaterials.push(materialId);
    const course = await Course.findById(courseId);
    const totalMaterials = course.sections.reduce((s, sec) => s + sec.materials.length, 0);
    enrollment.progressPercent = totalMaterials > 0 ? Math.round((enrollment.completedMaterials.length / totalMaterials) * 100) : 0;
    if (enrollment.progressPercent === 100) { enrollment.status = 'completed'; enrollment.completedAt = new Date(); }
    enrollment.lastAccessed = new Date();
    await enrollment.save();
  }
  sendSuccess(res, enrollment);
});

export const unenroll = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findOneAndDelete({ student: req.user._id, course: req.params.courseId });
  if (!enrollment) { res.status(404); throw new Error('Enrollment not found'); }
  await Course.findByIdAndUpdate(req.params.courseId, { $inc: { enrolledCount: -1 } });
  sendSuccess(res, null, 'Unenrolled successfully');
});

// ── QUIZ ──────────────────────────────────────────────────
export const createQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.create({ ...req.body, teacher: req.user._id });
  sendSuccess(res, quiz, 'Quiz created', 201);
});

export const getCourseQuizzes = asyncHandler(async (req, res) => {
  const query = { course: req.params.courseId };
  if (req.user.role === 'student') query.isPublished = true;
  const quizzes = await Quiz.find(query).select('-questions.options.isCorrect');
  sendSuccess(res, quizzes);
});

export const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) { res.status(404); throw new Error('Quiz not found'); }
  // Students don't see correct answers
  if (req.user.role === 'student') {
    quiz.questions.forEach(q => q.options?.forEach(o => { o.isCorrect = undefined; }));
  }
  const attempts = await QuizAttempt.countDocuments({ quiz: quiz._id, student: req.user._id });
  sendSuccess(res, { quiz, attemptsUsed: attempts });
});

export const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) { res.status(404); throw new Error('Quiz not found'); }
  Object.assign(quiz, req.body);
  await quiz.save();
  sendSuccess(res, quiz, 'Quiz updated');
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Quiz deleted');
});

export const submitQuiz = asyncHandler(async (req, res) => {
  const { quizId, answers, timeTaken } = req.body;
  const quiz = await Quiz.findById(quizId);
  if (!quiz) { res.status(404); throw new Error('Quiz not found'); }

  const attemptsCount = await QuizAttempt.countDocuments({ quiz: quizId, student: req.user._id });
  if (attemptsCount >= quiz.maxAttempts) { res.status(400); throw new Error('Max attempts reached'); }

  let score = 0, totalPoints = 0;
  const gradedAnswers = quiz.questions.map(q => {
    totalPoints += q.points;
    const studentAnswer = answers.find(a => a.questionId === q._id.toString());
    let isCorrect = false, pointsEarned = 0;
    if (q.type === 'mcq' || q.type === 'true_false') {
      const correctOpt = q.options.find(o => o.isCorrect);
      isCorrect = studentAnswer?.selectedOption === correctOpt?._id?.toString();
    } else if (q.type === 'short_answer') {
      isCorrect = studentAnswer?.textAnswer?.toLowerCase().trim() === q.correctAnswer?.toLowerCase().trim();
    }
    if (isCorrect) { pointsEarned = q.points; score += q.points; }
    return { question: q._id, selectedOption: studentAnswer?.selectedOption, textAnswer: studentAnswer?.textAnswer, isCorrect, pointsEarned };
  });

  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
  const attempt = await QuizAttempt.create({
    quiz: quizId, student: req.user._id, answers: gradedAnswers,
    score, totalPoints, percentage, passed: percentage >= quiz.passingScore,
    submittedAt: new Date(), timeTaken, attemptNumber: attemptsCount + 1,
  });
  sendSuccess(res, { attempt, score, percentage, passed: attempt.passed }, 'Quiz submitted');
});

export const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ student: req.user._id, quiz: req.params.quizId })
    .sort({ createdAt: -1 });
  sendSuccess(res, attempts);
});

export const getQuizResults = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ quiz: req.params.quizId })
    .populate('student', 'name email avatar')
    .sort({ createdAt: -1 });
  const stats = {
    total: attempts.length,
    passed: attempts.filter(a => a.passed).length,
    avgScore: attempts.length ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length) : 0,
    highScore: attempts.length ? Math.max(...attempts.map(a => a.percentage)) : 0,
  };
  sendSuccess(res, { attempts, stats });
});

// ── ASSIGNMENTS ──────────────────────────────────────────
export const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.create({ ...req.body, teacher: req.user._id });
  sendSuccess(res, assignment, 'Assignment created', 201);
});

export const getCourseAssignments = asyncHandler(async (req, res) => {
  const query = { course: req.params.courseId };
  if (req.user.role === 'student') query.isPublished = true;
  const assignments = await Assignment.find(query).sort({ dueDate: 1 });
  sendSuccess(res, assignments);
});

export const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) { res.status(404); throw new Error('Assignment not found'); }
  let submission = null;
  if (req.user.role === 'student') {
    submission = await Submission.findOne({ assignment: assignment._id, student: req.user._id });
  }
  sendSuccess(res, { assignment, submission });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  sendSuccess(res, assignment, 'Assignment updated');
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  await Assignment.findByIdAndDelete(req.params.id);
  sendSuccess(res, null, 'Assignment deleted');
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.assignmentId);
  if (!assignment) { res.status(404); throw new Error('Assignment not found'); }
  const existing = await Submission.findOne({ assignment: assignment._id, student: req.user._id });
  if (existing) { res.status(400); throw new Error('Already submitted'); }
  const files = req.files?.map(f => ({ name: f.originalname, url: `/uploads/pdfs/${f.filename}`, size: f.size, type: f.mimetype })) || [];
  const isLate = new Date() > assignment.dueDate;
  const submission = await Submission.create({
    assignment: assignment._id, student: req.user._id,
    files, comments: req.body.comments, isLate, status: isLate ? 'late' : 'submitted',
  });
  sendSuccess(res, submission, 'Assignment submitted', 201);
});

export const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ assignment: req.params.assignmentId })
    .populate('student', 'name email avatar')
    .sort({ createdAt: -1 });
  sendSuccess(res, submissions);
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const { grade, feedback } = req.body;
  const submission = await Submission.findById(req.params.submissionId);
  if (!submission) { res.status(404); throw new Error('Submission not found'); }
  submission.grade = grade;
  submission.feedback = feedback;
  submission.gradedBy = req.user._id;
  submission.gradedAt = new Date();
  submission.status = 'graded';
  await submission.save();
  sendSuccess(res, submission, 'Submission graded');
});

// ── CATEGORIES ────────────────────────────────────────────
export const getCategories = asyncHandler(async (req, res) => {
  const cats = await Category.find({ isActive: true }).sort({ name: 1 });
  sendSuccess(res, cats);
});

export const createCategory = asyncHandler(async (req, res) => {
  const cat = await Category.create(req.body);
  sendSuccess(res, cat, 'Category created', 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  sendSuccess(res, cat, 'Category updated');
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  sendSuccess(res, null, 'Category deactivated');
});

// ── ANALYTICS ─────────────────────────────────────────────
export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalCourses, totalEnrollments, recentUsers, recentEnrollments] = await Promise.all([
    User.countDocuments(),
    Course.countDocuments(),
    Enrollment.countDocuments(),
    User.find().select('name email role createdAt').sort({ createdAt: -1 }).limit(5),
    Enrollment.find().populate('student', 'name').populate('course', 'title').sort({ createdAt: -1 }).limit(5),
  ]);
  const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  const enrollmentsByMonth = await Enrollment.aggregate([
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': -1, '_id.month': -1 } }, { $limit: 12 },
  ]);
  sendSuccess(res, { totalUsers, totalCourses, totalEnrollments, usersByRole, enrollmentsByMonth, recentUsers, recentEnrollments });
});

export const getTeacherAnalytics = asyncHandler(async (req, res) => {
  const myCourses = await Course.find({ teacher: req.user._id }).select('_id title enrolledCount rating');
  const courseIds = myCourses.map(c => c._id);
  const [totalStudents, totalEnrollments, quizCount, assignmentCount] = await Promise.all([
    Enrollment.distinct('student', { course: { $in: courseIds } }),
    Enrollment.countDocuments({ course: { $in: courseIds } }),
    Quiz.countDocuments({ course: { $in: courseIds } }),
    Assignment.countDocuments({ course: { $in: courseIds } }),
  ]);
  sendSuccess(res, { totalCourses: myCourses.length, totalStudents: totalStudents.length, totalEnrollments, quizCount, assignmentCount, courses: myCourses });
});

export const getStudentAnalytics = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate('course', 'title thumbnail');
  const attempts = await QuizAttempt.find({ student: req.user._id }).populate('quiz', 'title');
  const submissions = await Submission.find({ student: req.user._id }).populate('assignment', 'title maxPoints');
  const avgProgress = enrollments.length ? Math.round(enrollments.reduce((s, e) => s + e.progressPercent, 0) / enrollments.length) : 0;
  sendSuccess(res, { totalEnrolled: enrollments.length, avgProgress, completedCourses: enrollments.filter(e => e.status === 'completed').length, quizzesTaken: attempts.length, assignmentsSubmitted: submissions.length, enrollments, recentAttempts: attempts.slice(0, 5) });
});
