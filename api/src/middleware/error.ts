import type {  Request, Response, NextFunction } from "express";


interface CustomError extends Error {
    statusCode?: number;
    code?: number;  // MongoDB duplicate key errors carry code 11000
}
// error middleware goes here.
export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction)=>{

    if (err.name === 'ValidationError') {
  // Mongoose schema validation: client sent bad data, not a server fault
  return res.status(400).json({
    success: false,
    message: err.message
  });
}

  if (err.code === 11000) {
  // Mongoose duplicate key error: client sent duplicate data, not a server fault
  return res.status(409).json({
    success: false,
    message: 'Resource already exists'
  });
}

if(err.name === 'CastError'){
      return res.status(400).json({
    success: false,
    message: 'Invalid ID format'
  });
}
const statusCode = err.statusCode || 500;

res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    // Only show stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
})
}
