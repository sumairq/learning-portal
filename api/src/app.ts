// this is app.ts file
import express from "express";
import cookieParser from 'cookie-parser'
import { errorHandler } from "./middleware/error.js";
import authRouter from './routes/auth.js'
import courseRouter from './routes/courses.js'

import { protect, restrictTo } from "./middleware/auth.js";
const app = express()

app.use(express.json())
app.use(cookieParser())
// Routes 

app.use('/api/auth', authRouter )
app.use('/api/courses', courseRouter )


app.get('/', (req,res)=>{
    res.send('Hello World')
})
app.get('/api/health', (req,res)=>{
    res.json({
        status: 'ok'
    })
})

app.get('/api/me',protect,restrictTo('instructor'), (req,res)=>{
    res.json({
        status: 'ok', 
        message: 'You are accessing a protected route, congratulations!',
        user: req.user
    })
})
// 404 catcher middleware
app.use((req,res,next)=>{
    res.status(404).json({
        status: 404,
        message: `Cannot ${req.method} ${req.url}`
    })
})

// global error middleware
app.use(errorHandler)


export default app