import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import Loading from '../../components/student/Loading';
import humanizeDuration from 'humanize-duration';
import Footer from '../../components/student/Footer';
import YouTube from 'react-youtube';
import axios from 'axios';
import { toast } from 'react-toastify';

const CourseDetails = () => {

  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSection, setOpenSection] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)
  const [playerData, setPlayerData] = useState(true);


  const { allCourses, calculateRating, calculateChapterTime, calculateCourseDuration, calculateNumberOfLectures, currency, backendUrl, userData, getToken } = useContext(AppContext);

  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/course/' + id);

      if (data.success) {
        setCourseData(data.courseData);
      }
      else {
        toast.error(data.courseData);
      }
    } catch (error) {
      toast.error(data.message)
    }
  };
  
  const enrollCourse = async() => {
    try {
      if(!userData) {
        return toast.warn('Login to Enroll');
      }
      if (isAlreadyEnrolled) {
        return toast.warn('Already enrolled');
      }

      const token = await getToken();

      const { data } = await axios.post(backendUrl + '/api/user/purchase', {courseId: courseData._id}, {headers: {Authorization: `Bearer ${token}`}});

      if (data.success) {
        const {session_url} = data;
        window.location.replace(session_url);
      }

      else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchCourseData();
  }, []);

  useEffect(() => {
    if (
      userData &&
      courseData &&
      Array.isArray(userData.enrolledCourses)
    ) {
      console.log(userData.enrolledCourses);
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id));
    }
  }, [userData, courseData]);
  

  const toggleSection = (index) =>{
    setOpenSection((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  }



  return courseData ? (<>
    <div className='flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-32 pt-20 text-left'>

      <div className="absolute top-0 left-0 w-full h-section-height bg-gradient-to-b from-cyan-100/70 to-transparent"></div>

      {/* Left Column */}
      <div className='max-w-xl z-10 text-gray-500'>
        <h1 className='md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800'>
          {courseData.courseTitle}
        </h1>
        <p className='pt-4 md:text-base text-sm' 
          dangerouslySetInnerHTML={{ __html: courseData.courseDescription?.slice(0, 200) }}>
        </p>

        {/* Review and Rating */}
        <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
          <p>{calculateRating(courseData)}</p>
          <div className='flex'>
            {[...Array(5)].map((_, i) => (
              <img key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt='' className='w-3.5 h-3.5' />
            ))}
          </div>
          <p className='text-blue-500'>({courseData.courseRatings.length} {courseData.courseRatings.length > 1 ? 'ratings' : 'rating'})</p>

          <p>{courseData.enrolledStudents.length} {courseData.enrolledStudents.length ? 'students' : 'student'}</p>
        </div>

        <p className='text-sm'>Course by <span className='text-blue-600 underline'>{courseData.educator.name}</span></p>

        <div className='pt-8 text-gray-800'>
          <h2 className='text-xl font-semibold'></h2>

          <div className='pt-5'>
            {courseData.courseContent.map((chapter, index) => (
              <div key={index} className='border border-gray-300 bg-white mb-2 rounded'>
                <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none' onClick={() => toggleSection(index)}>
                  <div className='flex items-center gap-2'>
                    <img className={`transform transition-transfor ${openSection[index]? 'rotate-180' : ''}`} src={assets.down_arrow_icon} alt="arrow icon" />
                    <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                  </div>
                  <p className='text-sm md:text-default'>{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ${openSection[index] ? 'max-h-screen' : 'max-h-0'}`}>

                  <ul className='list-disc md:pl-10 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                    {chapter.chapterContent.map((lecture, index) => (
                      <li key={index} className='flex items-start gap-2 py-1'>
                        <img src={assets.play_icon} alt="play icon" className='w-4 h-4 mt-1' />
                          <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                            <p className='text-sm'>{lecture.lectureTitle}</p>
                            <div className='flex gap-2'>
                              {lecture.isPreviewFree && <p onClick={() => setPlayerData(
                                {
                                  videoId: lecture.lectureUrl.split('/').pop()
                                }
                              )} className='text-blue-500 cursor-pointer'>Preview</p>}
                              <p className='text-sm'>{humanizeDuration(lecture.lectureDuration * 60 *1000, {units :['h','m']})}</p>
                            </div>
                          </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='py-20 text-sm md:text-default'>
          <h3 className='text-xl font-semibold text-gray-800'>Course Description</h3>
          <p className='pt-3 rich-text' 
          dangerouslySetInnerHTML={{ __html: courseData.courseDescription}}>
        </p>
        </div>
      </div>

      {/* Right Column */}
      <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
        {/* Image without space */}
        <div className="w-full h-auto">
        {
            playerData ? <YouTube videoId={playerData.videoId} opts={{playerVars: {
              autoplay: 1  }}} iframeClassName='w-full aspect-video' /> :  <img className="w-full h-full object-cover" src={courseData.courseThumbnail} alt="" />
        }
        </div>

        <div className="pt-5 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <img className="w-3.5" src={assets.time_left_clock_icon} alt="time_left_clock_icon" />
            <p className="text-red-500"><span className="font-medium">5 days</span> left at this price!</p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
              {currency}{(courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2)}
            </p>
            <p className="md:text-lg text-gray-500 line-through">{currency} {courseData.coursePrice}</p>
            <p className="md:text-lg text-gray-500">{courseData.discount} % off</p>
          </div>

          <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
            <div className="flex items-center gap-1">
              <img src={assets.star} alt="star icon" />
              <p>{calculateRating(courseData)}</p>
            </div>
            <div className="h-4 w-px border-gray-500/40"></div>
            <div className="flex items-center gap-1">
              <img src={assets.time_clock_icon} alt="clock icon" />
              {courseData && courseData.courseContent && <p>{calculateCourseDuration(courseData)}</p>}
            </div>
            <div className="h-4 w-px border-gray-500/40"></div>
            <div className="flex items-center gap-1">
              <img src={assets.lesson_icon} alt="lesson icon" />
              {courseData && courseData.courseContent && <p>{calculateNumberOfLectures(courseData)} lessons</p>}
            </div>
          </div>

        {/* Enroll Button */}
        <div className="md:mt-5 mt-2 w-full pb-4">
          <button onClick={enrollCourse} className="w-full py-3 rounded bg-blue-600 text-white font-medium cursor-pointer">
            {isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}
          </button>
        </div>

        <div className='pt-3 pb-4'>
          <p className='md:text-xl text-lg font-medium  text-gray-800'>What's in the course?</p>
          <ul className='ml-4 pt-2 text-sm md:text-default list-disc text-gray-500'>
            <li>Lifetime access with free updates.</li>
            <li>Step-by-step, hands-on project guidance.</li>
            <li>Downloadable resources and source code.</li>
            <li>Quizzes to test your knowledge.</li>
            <li>Certificate of completion.</li>
          </ul>
        </div>

        </div>
      </div>

    </div>
    <Footer/>
    </>
  ) : <Loading />;
};

export default CourseDetails;