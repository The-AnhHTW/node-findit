import mongoose, { model, Schema, SchemaTypes } from 'mongoose';
import { Skill } from '../Skill/SkillModel';

interface Skillinfluence { 
    skill: Skill,
    pickedScore: number,
    notPickedScore: number,
}

const SkillInfluenceSchema = new Schema<Skillinfluence>({
    skill: {type: SchemaTypes.ObjectId, ref: "Skill"},
})


export default model<Skillinfluence>("SkillInfluence", SkillInfluenceSchema);

