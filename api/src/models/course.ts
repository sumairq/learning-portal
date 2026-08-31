import mongoose, {Document, Types} from 'mongoose';
const {Schema} = mongoose;


//  Interface for the lesson subdocument

interface ILesson {
    title: string;
    videoUrl: string;
    order: number;
}

// Interface for the course
export interface ICourse extends Document {
    title: string;
    description: string;
    instructorId: Types.ObjectId;
    lessons: ILesson[];
    avgRating: number;
    reviewCount: number;
    category: "programming" | "design" | "business";
    createdAt: Date;
    updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>({
    title: {type: String, required: true},
    videoUrl: {type: String, required: true},
    order: {type: Number, required: true}
})

const courseSchema = new Schema<ICourse>({
  title: {type: String, required: true},
  description: {type: String, required: true},
  instructorId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  lessons: [lessonSchema],
  avgRating: {type: Number, default: 0},
  reviewCount: {type: Number, default: 0}, 
  category: {type: String, enum: ["programming", "design", "business"], required: true},
}, {timestamps: true})

const Course = mongoose.model<ICourse>('Course', courseSchema);
export default Course;

