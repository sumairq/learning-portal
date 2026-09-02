import mongoose from "mongoose";


const dbConnect = async ()=>{
  try{
    const mongoURI = process.env.MONGO_URI
    if(!mongoURI){
        console.error('❌ Error: MONGO_URI environment variable is missing.')
        throw new Error('MONGO_URI environment variable is missing.');
        
    }
    const conn =  await mongoose.connect(mongoURI)
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`)

  }catch(error){
    console.error(`❌ Initial connection error: ${(error as Error).message}`)
    throw error;
  }
}

mongoose.connection.on('error',(err)=>{
    console.error(`🚨 MongoDB runtime error: ${err}`);
})


mongoose.connection.on('disconnected',()=>{
    console.warn('⚠️ MongoDB connection lost. Attempting reconnection...');
})


export default dbConnect