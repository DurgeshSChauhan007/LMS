import Course from "../models/Course.js";


// Get all courses
export const getAllCourse = async(req, res) => {
    try {
        const courses = await Course.find({isPublished: true}).select(['-courseContent', '-educator']).populate({path: 'educator'})

        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message})
    }
} 

// Get Course by Id
export const getCourseById = async(req, res) => {
    const {id} = req.params;

    try {
        const courseData = await Course.findById(id).populate({path: 'educator'});

        // Remove lectureUrl if isPreviewFree is free

        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if (lecture.isPreviewFree) {
                    lecture.lectureUrl = "";
                }
            })
        })

        res.json({ success: true, courseData });
    } catch (error) {
        res.json({ success: false, message: error.message});
    }
}

