import asyncHandler from 'express-async-handler';
import { Course, Enrollment, User } from '../models/index.js';
import { sendSuccess } from '../utils/helpers.js';

// @GET /api/courses
export const getCourses = asyncHandler(async (req, res) => {
  const { category, teacher, search, level, page = 1, limit = 12, sort = 'newest', published } = req.query;
  const query = {};
  if (published !== 'all') query.isPublished = true;
  if (req.user?.role === 'admin' && published === 'all') delete query.isPublished;
  if (category) query.category = category;
  if (teacher) query.teacher = teacher;
  if (level) query.level = level;
  if (search) query.$or = [
    { title: { $regex: search, $options: 'i' } },
    { description: { $regex: search, $options: 'i' } },
    { tags: { $in: [new RegExp(search, 'i')] } },
  ];

  // Teacher sees only their courses
  if (req.user?.role === 'teacher') { query.teacher = req.user._id; delete query.isPublished; }

  const sortMap = { newest: { createdAt: -1 }, popular: { enrolledCount: -1 }, rating: { rating: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 } };
  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('category', 'name color icon')
    .populate('teacher', 'name avatar')
    .select('-sections.materials.url')
    .sort(sortMap[sort] || { createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  sendSuccess(res, { courses, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @GET /api/courses/:id
export const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('category', 'name color icon')
    .populate('teacher', 'name avatar bio email');
  if (!course) { res.status(404); throw new Error('Course not found'); }
  // Only enrolled students/teachers/admin see full materials
  const isEnrolled = req.user ? await Enrollment.findOne({ student: req.user._id, course: course._id }) : false;
  const canSeeAll = req.user?.role === 'admin' || req.user?._id?.toString() === course.teacher?._id?.toString() || isEnrolled;
  if (!canSeeAll) {
    // Redact private material URLs
    course.sections.forEach(s => s.materials.forEach(m => { if (!m.isPublic) m.url = null; }));
  }
  sendSuccess(res, { course, isEnrolled: !!isEnrolled });
});

// @POST /api/courses  (admin, teacher)
export const createCourse = asyncHandler(async (req, res) => {
  const { title, description, shortDescription, category, price, discountPrice, level, language, tags, requirements, whatYouLearn, teacherId } = req.body;
  const assignedTeacher = req.user.role === 'admin' && teacherId ? teacherId : req.user._id;
  const course = await Course.create({
    title, description, shortDescription, category, price: price || 0, discountPrice,
    level, language, tags: tags || [], requirements: requirements || [],
    whatYouLearn: whatYouLearn || [], teacher: assignedTeacher,
    thumbnail: req.file ? `/uploads/images/${req.file.filename}` : '',
  });
  sendSuccess(res, course, 'Course created', 201);
});

// @PUT /api/courses/:id
export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized to update this course');
  }
  const fields = ['title', 'description', 'shortDescription', 'category', 'price', 'discountPrice', 'level', 'language', 'tags', 'requirements', 'whatYouLearn', 'isPublished', 'isFeatured', 'certificate'];
  fields.forEach(f => { if (req.body[f] !== undefined) course[f] = req.body[f]; });
  if (req.user.role === 'admin' && req.body.teacher) course.teacher = req.body.teacher;
  if (req.file) course.thumbnail = `/uploads/images/${req.file.filename}`;
  const updated = await course.save();
  sendSuccess(res, updated, 'Course updated');
});

// @DELETE /api/courses/:id  (admin)
export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  await course.deleteOne();
  sendSuccess(res, null, 'Course deleted');
});

// @POST /api/courses/:id/sections  (teacher)
export const addSection = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  course.sections.push({ title: req.body.title, description: req.body.description, order: course.sections.length });
  await course.save();
  sendSuccess(res, course, 'Section added');
});

// @POST /api/courses/:id/sections/:sectionId/materials  (teacher)
export const addMaterial = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (req.user.role !== 'admin' && course.teacher.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  const section = course.sections.id(req.params.sectionId);
  if (!section) { res.status(404); throw new Error('Section not found'); }

  const { title, type, isPublic, duration } = req.body;
  let url = req.body.url || '';
  if (req.file) {
    const folder = req.file.mimetype === 'application/pdf' ? 'pdfs' : req.file.mimetype.startsWith('video/') ? 'videos' : 'images';
    url = `/uploads/${folder}/${req.file.filename}`;
  }
  section.materials.push({ title, type, url, isPublic: isPublic === 'true', duration, fileSize: req.file?.size, order: section.materials.length });
  await course.save();
  sendSuccess(res, course, 'Material added');
});

// @DELETE /api/courses/:id/sections/:sectionId/materials/:materialId
export const deleteMaterial = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  const section = course.sections.id(req.params.sectionId);
  if (!section) { res.status(404); throw new Error('Section not found'); }
  section.materials.pull(req.params.materialId);
  await course.save();
  sendSuccess(res, null, 'Material deleted');
});

// @DELETE /api/courses/:id/sections/:sectionId
export const deleteSection = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  course.sections.pull(req.params.sectionId);
  await course.save();
  sendSuccess(res, null, 'Section deleted');
});
