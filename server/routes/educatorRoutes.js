import express from 'express'
import { addCourse, updateRoleToEducator, getEducatorCourses, educatorDashboardData, getEnrolledStudentsData } from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protecteducator } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router();

// Add Educator Role
educatorRouter.get('/update-role', updateRoleToEducator);
educatorRouter.post('/add-course', upload.single('image'), protecteducator, addCourse)
educatorRouter.get('/courses', protecteducator, getEducatorCourses);
educatorRouter.get('/dashboard', protecteducator, educatorDashboardData);
educatorRouter.get('/enrolled-students', protecteducator, getEnrolledStudentsData);

export default educatorRouter;