import mongoose, {Document, Types} from 'mongoose';
const {Schema} = mongoose;


export interface IEnrollment extends Document {
courseId: Types.ObjectId;
userId: Types.ObjectId;
completedLessons: Types.ObjectId[];
amountPaid: number;
status: 'active' | 'completed'| 'refunded';
createdAt: Date;
updatedAt: Date;

}

const enrollmentSchema = new Schema<IEnrollment>({
    courseId: {type: Schema.Types.ObjectId, ref: 'Course', required: true},
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    completedLessons: [{type: Schema.Types.ObjectId}],
    amountPaid: {type: Number, required: true},
    status: {type: String, enum: ['active', 'completed', 'refunded'], default: 'active'}
}, {timestamps: true})


enrollmentSchema.index({courseId: 1, userId: 1}, {unique: true})

const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
export default Enrollment;