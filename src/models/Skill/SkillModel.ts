import mongoose, { model, Schema, SchemaTypes } from 'mongoose';
import { Job } from '../Job/JobModel';


export interface Skill { 
    skill: string,
    job: Job,
    description: string,
}

const SkillSchema = new Schema<Skill>({
    skill: String,
    job: {type:SchemaTypes.ObjectId, ref: 'Job'},
    description: String
})  

export default model<Skill>('Skill', SkillSchema);