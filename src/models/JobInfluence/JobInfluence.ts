import mongoose, { model, Schema, SchemaTypes } from 'mongoose';
import { AnswerOption } from '../AnswerOption/AnswerModel';
import { Job } from '../Job/JobModel';


export enum Measure {
    tasks = "Tasks",
    personality = "Personality",
    competences = "Competences"
}

export interface JobInfluence {
    job: Job,
    pickedScore: number,
    notPickedScore: number,
    answerOption: AnswerOption
}

const JobInfluenceSchema = new Schema<JobInfluence>({
    job: {type: SchemaTypes.ObjectId, ref: 'Job'},
    pickedScore: Number,
    notPickedScore: Number,
    answerOption: { type:SchemaTypes.ObjectId, ref:'AnswerOption' }
})

export default model<JobInfluence>('JobInfluence', JobInfluenceSchema);

