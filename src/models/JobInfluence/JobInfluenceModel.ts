import { Skillinfluence } from '@models/SkillInfluence/SkillInfluenceModel';
import mongoose, { model, Schema, SchemaTypes } from 'mongoose';
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
    skillInfluences: Skillinfluence[]
}

const JobInfluenceSchema = new Schema<JobInfluence>({
    job: { type: SchemaTypes.ObjectId, ref: 'Job' },
    pickedScore: Number,
    notPickedScore: Number,
    skillInfluences: [{ type: SchemaTypes.ObjectId, ref: 'SkillInfluence' }]
})

export default model<JobInfluence>('JobInfluence', JobInfluenceSchema);

