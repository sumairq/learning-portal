import type { NextFunction, Request, Response } from "express";
import Course from "../models/course.js";
import Enrollment from "../models/enrollment.js";




// Create a new enrollment 
export const createEnrollment = async (req: Request, res: Response, next: NextFunction)=>{
 
    // fetch fields from request body

    try{
    if(!req.body.courseId){
        return res.status(400).json({message: 'CourseId not provided'})
    }
        
    if(!req.user){
      return res.status(401).json({message: 'Login to enroll'})
    }

    const [course, enrollmentExists] = await Promise.all([Course.findById(req.body.courseId), Enrollment.findOne({userId: req.user.userId, courseId: req.body.courseId})])
    if(!course){
       return res.status(404).json({message: 'Course not found'})
    }
    if(enrollmentExists){
       return res.status(409).json({message: "You are already enrolled in this course" })
    }

      const enrollment = await Enrollment.create({
        courseId: req.body.courseId,
        userId: req.user.userId,
        amountPaid: course.price,
      })

      return res.status(201).json({message: 'Enrolled successfully', enrollment})
     
    }catch(error){
     next(error)
    }
}

// Get my enrollments 
export const getMyEnrollments = async (req: Request, res: Response, next: NextFunction)=>{
  
    try{

        if(!req.user){
           return res.status(401).json({message: 'Login to see enrollments'})
        }
     const enrollments = await Enrollment.find({userId: req.user.userId}).populate('courseId', 'title description category avgRating');

     return res.status(200).json({enrollments})

    }
     catch(error){
        next(error)
     }   
    }