//server file
import 'dotenv/config'
import app from './app.js'
import dbConnect from './config/db.js'
const port = process.env.PORT || 5000

try{
  await dbConnect()
  console.log('📦 Database connected successfully');
 app.listen(port, ()=>{
    console.log(`Example app listening on port ${port}`)
})

}catch(error){
  console.error('❌ Database connection failed:', error);
    process.exit(1);
}

