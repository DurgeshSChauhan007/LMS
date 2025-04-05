import express from 'express';
import { addUserRatings, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgess, userEnrollledCourse } from '../controllers/userController.js';


const userRouter = express.Router();

userRouter.get('/data', getUserData);
userRouter.get('/enrolled-courses', userEnrollledCourse);
userRouter.post('/purchase', purchaseCourse);

userRouter.post('/update-course-progress', updateUserCourseProgess);
userRouter.post('/get-coutse-progress', getUserCourseProgress);
userRouter.post('/add-rating', addUserRatings);

export default userRouter;