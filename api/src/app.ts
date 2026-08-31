// this is app.ts file
import express from "express";
import dbConnect from "./config/db.js";
const app = express()

dbConnect()

app.get('/', (req,res)=>{
    res.send('Hello World')
})


export default app