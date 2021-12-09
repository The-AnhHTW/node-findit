import { JobInfluence } from '@models/JobInfluence/JobInfluenceModel';
import mongoose, { Schema, model, SchemaTypes } from 'mongoose';

export interface AnswerOption {
    text: string,
    labels: string[],
    jobInfluences: JobInfluence[]
}




export const AnswerOptionSchema = new Schema({
    text: String,
    labels: [String],
    jobInfluences: [{ type: SchemaTypes.ObjectId, ref: 'JobInfluence' }]
})

const AnswerOptionModel = model<AnswerOption>('AnswerOption', AnswerOptionSchema);

export default AnswerOptionModel;
