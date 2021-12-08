import mongoose, { model, Schema, SchemaTypes } from 'mongoose';
import { JobEnum } from '../Job/JobModel';
import { Question } from '../Question/QuestionModel';
import { UnserAnswerOptionSchema, UserAnswerOption } from '../AnswerOption/UserAnswerOptionModel';
type Result = {
    [key in JobEnum]: {
        score: number;
        max_score: number;
        tasks: {
            max_score: number,
            score: number
        },
        personality: {
            max_score: number,
            score: number
        },
        competences: {
            max_score: number,
            score: number
        },
        skills: object,
        id: string
    }
}


interface Questionaire {
    result: Result,
    questionHistory: Question[],
    answerHistory: [UserAnswerOption[]]
}






export const QuestionaireSchema = new Schema<Questionaire>({
    // result: SchemaTypes.Mixed,
    questionHistory: [{ ref: 'Question', type: SchemaTypes.ObjectId }],
    answerHistory: [[{
        ref: 'UserAnswerOption',
        type: SchemaTypes.ObjectId
    }]]
},
    {
        timestamps: {
            createdAt: 'created_at', updatedAt: 'updated_at'
        },
    })




export default model<Questionaire>('Questionaire', QuestionaireSchema);