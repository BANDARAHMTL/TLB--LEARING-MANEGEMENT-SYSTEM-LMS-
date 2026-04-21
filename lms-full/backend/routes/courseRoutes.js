// courseRoutes.js
import express from 'express';
import { getCourses, getCourseById, createCourse, updateCourse, deleteCourse, addSection, addMaterial, deleteMaterial, deleteSection } from '../controllers/courseController.js';
import { protect, admin, teacher } from '../middleware/authMiddleware.js';
import { upload } from '../config/upload.js';

const r = express.Router();
r.get('/', getCourses);
r.get('/:id', getCourseById);
r.post('/', protect, teacher, upload.single('thumbnail'), createCourse);
r.put('/:id', protect, teacher, upload.single('thumbnail'), updateCourse);
r.delete('/:id', protect, admin, deleteCourse);
r.post('/:id/sections', protect, teacher, addSection);
r.delete('/:id/sections/:sectionId', protect, teacher, deleteSection);
r.post('/:id/sections/:sectionId/materials', protect, teacher, upload.single('file'), addMaterial);
r.delete('/:id/sections/:sectionId/materials/:materialId', protect, teacher, deleteMaterial);
export default r;
