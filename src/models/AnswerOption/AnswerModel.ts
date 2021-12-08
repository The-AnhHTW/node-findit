import mongoose, { Schema, model } from 'mongoose';

export interface AnswerOption {
    text: string,
    labels: string[]
}




export const AnswerOptionSchema = new Schema({
    text: String,
    labels: [String]
})

const AnswerModel = model<AnswerOption>('AnswerOption', AnswerOptionSchema);

export default AnswerModel;
