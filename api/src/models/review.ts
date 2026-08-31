import mongoose, {Types, Document} from 'mongoose';
const {Schema} = mongoose;

export interface IReview extends Document {
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    rating: number;
    message?: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    courseId: {type: Schema.Types.ObjectId, ref: 'Course', required: true},
    rating: {type: Number, min: 1, max: 5, required: true},
    message: String,
}, {timestamps: true})

const Review = mongoose.model<IReview>('Review', reviewSchema);
export default Review;