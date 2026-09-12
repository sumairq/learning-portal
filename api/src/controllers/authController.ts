// this is the auth controller

import User from "../models/user.js";
import jwt from 'jsonwebtoken'

export const registerUser = async (req, res)=>{
    // Registration logic goes here

    const {name, email,password,role} = req.body

    const existingUser =await User.findOne({email})

    if(existingUser){
        return res.status(409).json({
            message: "User already exists"
        })
    }

   const user = await User.create({
        name,
        email,
        password
    })

    // create token 

    const token = jwt.sign({
        userId: user._id
    }, process.env.JWT_SECRET!,{expiresIn: "15m"})

    // send the token to the client within a cookie
    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax'
    })
    console.log(name, email, role)
    res.status(201).json({message: "User registered successfully", user: {
        id: user._id,
        name: user.name,
        email: user.email
    },
token: token});
}