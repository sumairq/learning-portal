// this is app.ts file
import express from "express";
import { errorHandler } from "./middleware/error.js";
import authRouter from './routes/auth.js'
const app = express()

app.use(express.json())

// Routes 

app.use('/api/auth', authRouter )

app.get('/', (req,res)=>{
    res.send('Hello World')
})
app.get('/api/health', (req,res)=>{
    res.json({
        status: 'ok'
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