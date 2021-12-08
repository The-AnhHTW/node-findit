import mongoose, { model, Schema } from 'mongoose';


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
    _id: string,
    question: string,
    questionType: QuestionType,
}


const QuestionSchema = new Schema<Question>({
    question: String,
    questionType: { type: String, enum: ["Multiple Choice", "Rank Order", "Multiple Options", "Likert Scale"] },
    
})

export default model<Question>('Question', QuestionSchema)

