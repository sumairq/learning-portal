import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";
const { Schema } = mongoose;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "instructor"], default: "student" },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  // Only hash password if it has been modified or new, other wise  a re-save would hash the already hashed value
  if (!this.isModified("password")) return;

  // Generate a salt and hash the password
  const saltRounds = 12; // 12 rounds balances security and performance
  this.password = await bcrypt.hash(this.password, saltRounds);
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
