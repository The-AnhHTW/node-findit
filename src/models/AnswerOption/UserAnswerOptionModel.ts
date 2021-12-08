import { Schema, model } from 'mongoose';
import { AnswerOption } from './AnswerModel';

export interface UserAnswerOption {
    answerOption: AnswerOption,
    rank: number,
    picked: Boolean
}

export const UnserAnswerOptionSchema = new Schema<UserAnswerOption>({
    answerOption: { type: Schema.Types.ObjectId, ref: 'AnswerOption' }
})

export default model<UserAnswerOption>('UserAnswerOption', UnserAnswerOptionSchema);