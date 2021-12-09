import { AnswerOption } from '@models/AnswerOption/AnswerOptionModel';
import mongoose, { model, Schema, SchemaTypes } from 'mongoose';


export enum QuestionType {
    MC = "Multiple Choice",
    RC = "Rank Order",
    MO = "Multiple Options",
    LS = "Likert Scale"
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
    questionType: { type: String, enum: ["Multiple Choice", "Rank Order", "Multiple Options", "Likert Scale"] },
    questionMeasure: { type: String, enum: ["Tasks", "Personality", "Competences"] },
    stageQuestion: Boolean,
    answerOptions: [{type:SchemaTypes.ObjectId, ref: "AnswerOption"}]
})

export default model<Question>('Question', QuestionSchema)

