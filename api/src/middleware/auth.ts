import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import type { JwtUserPayload } from "../types/express.js";


import type { NextFunction, Request, Response } from "express";

export const protect = (req: Request, res: Response, next: NextFunction)=>{
// get the authorization header

const authHeader = req.headers['authorization'];

// figure out where the cookie is coming from and then have only one variable holding it .
const token = authHeader?.split(' ')[1] || req.cookies?.accessToken

if(!token){
    return res.status(401).json({message: 'Access denied. No token provided.'})
}

try{
    // 3. Verify the token using your secret key
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtUserPayload; // replace this double cast once Zod lands.

    req.user = decoded;

    // pass the control to the next function
    next();
}catch(error){
// If verfication fails (expired or invalid token)
return res.status(401).json({message: 'Invalid or expired token.' })
}
};


