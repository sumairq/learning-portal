 const mongoURI = process.env.MONGO_URI
 const port = process.env.PORT
 const jwtSecret = process.env.JWT_SECRET




 if(!mongoURI){
        console.error('❌ Error: MONGO_URI environment variable is missing.')
        process.exit(1)
        
    }

     if(!port){
        console.error('❌ Error: PORT environment variable is missing.')
        process.exit(1)
        
    }

     if(!jwtSecret){
        console.error('❌ Error: JWT_SECRET environment variable is missing.')
        process.exit(1)
        
    }

export const JWT_SECRET: string = jwtSecret;
export const MONGO_URI: string = mongoURI;
export const PORT: string = port;