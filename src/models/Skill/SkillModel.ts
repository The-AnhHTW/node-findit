import mongoose, { model, Schema, SchemaTypes } from 'mongoose';
import { Job } from '../Job/JobModel';

export enum SkillCategory {
    tasks = 'tasks',
    personality = 'personality',
    soft_skills = 'soft_skills',
    hard_skills = 'hard_skills'
}

export interface Skill {
    skill: string,
    skillCategory: SkillCategory,
    show: boolean,
    generic: boolean,
    description: string,
}

const SkillSchema = new Schema<Skill>({
    skill: String,
    generic: { type: Boolean, default: false },
    show: { type: Boolean, default: true },
    skillCategory: { type: String, default: SkillCategory.hard_skills },
    // job: { type: SchemaTypes.ObjectId, ref: 'Job' },
    description: { type: String, default: "" },
})

export default model<Skill>('Skill', SkillSchema);