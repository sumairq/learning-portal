import type { NextFunction, Request, Response } from "express";
import Course from "../models/course.js";


// Create a new course 
export const createCourse = async (req: Request, res: Response, next: NextFunction)=>{
if (!req.user) {
  return res.status(401).json({ message: 'Not authenticated' });
}
    // get the fields 
try{

    const {title, description, category, lessons} = req.body
    
    if(!title || !description || !category || !lessons){
        return res.status(400).json({message: 'Missing field/s!'})
    }
    
    //take the fields and create a course
    
    
    const course = await Course.create({
        title, 
        description,
        instructorId: req.user.userId,
        category, 
        lessons
    })
    
    res.status(201).json({message: "Course successfully created", course})
    
}catch(error){
    next(error)
}
}