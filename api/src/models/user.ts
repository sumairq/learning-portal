import mongoose,{Types, Document} from 'mongoose';
import bcrypt from 'bcryptjs';
const {Schema} = mongoose


export interface IUser extends Document {
name: string,
email: string,
password: string,
role: string
}


const userSchema = new Schema<IUser>({
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true, unique: true, lowercase: true},
    password: {type: String, required: true, select: false},
    role: {type: String, enum: ["user", "admin"], default: "user"} 

},{timestamps: true})

userSchema.pre('save', async function (){
    // Only hash password if it has been modified or new
    if(!this.isModified('password')){
       return
    }
    try{
       // Generate a salt and hash the password
       const saltRounds = 12; // 12 rounds balances security and performance
       this.password = await bcrypt.hash(this.password, saltRounds);
       return
    }catch(error){
       throw error; //Pass the error to Mongoose if hashing fails
    }
})

const User = mongoose.model<IUser>('User', userSchema)

export default User