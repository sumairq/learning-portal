//server file
import 'dotenv/config'
import app from './app.js'
import dbConnect from './config/db.js'
const port = process.env.PORT

dbConnect()

app.listen(port, ()=>{
    console.log(`Example app listening on port ${port}`)
})