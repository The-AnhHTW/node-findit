import { AnswerOption } from '@models/AnswerOption/AnswerOptionModel';
import mongoose, { model, Schema, SchemaTypes } from 'mongoose';


export enum QuestionType {
    MC = "Multiple Choice",
    RO = "Rank Order",
    MO = "Multiple Options",
    LS = "Likert Scale",
    FC = "Forced Choice"
}

export enum QuestionMeasure {
    tasks = "Tasks",
    personality = "Personality",
    competences = "Competences"
}


export interface Question {

    question: string,
    questionType: QuestionType,
    questionMeasure: QuestionMeasure,
    stageQuestion: boolean,
    answerOptions: AnswerOption[]
}


const QuestionSchema = new Schema<Question>({
    question: String,
    questionType: { type: String, enum: ["Multiple Choice", "Rank Order", "Multiple Options", "Likert Scale", "Forced Choice"] },
    questionMeasure: { type: String, enum: ["Tasks", "Personality", "Competences"] },
    stageQuestion: Boolean,
    answerOptions: [{type:SchemaTypes.ObjectId, ref: "AnswerOption"}]
})

export default model<Question>('Question', QuestionSchema)

