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
    answerHistory: any[],
    survey: any | null,
    finished: boolean
}






export const QuestionaireSchema = new Schema<Questionaire>({
    answerHistory: [{ type: Object }],
    finished: {type:Boolean, default:true},
    //@ts-ignore
    result: { type: Object },
    survey: { type: SchemaTypes.ObjectId, ref: 'Survey' }
},
    {
        timestamps: {
            createdAt: 'created_at', updatedAt: 'updated_at'
        },
    })




export default model<Questionaire>('Questionaire', QuestionaireSchema);