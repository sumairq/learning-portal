import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import * as z from "zod";

import type { NextFunction, Request, Response } from "express";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  // get the authorization header

  const authHeader = req.headers["authorization"];

  // figure out where the cookie is coming from and then have only one variable holding it .
  const cookieToken: unknown = req.cookies?.accessToken;
  const token =
    authHeader?.split(" ")[1] ??
    (typeof cookieToken === "string" ? cookieToken : undefined);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // 3. Verify the token using your secret key
    const jwtPayloadSchema = z.object({
      userId: z.string(),
      role: z.enum(["student", "instructor"]),
    });
    const decoded = jwtPayloadSchema.parse(jwt.verify(token, JWT_SECRET)); // replace this double cast once Zod lands.

    req.user = decoded;

    // pass the control to the next function
    next();
  } catch {
    // If verfication fails (expired or invalid token)
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export const restrictTo = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // this guard is defensive, unreachable when protect middleware runs first.
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};
