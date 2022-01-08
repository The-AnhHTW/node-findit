import mongoose, { model, Schema, SchemaTypes } from 'mongoose';
import { Skill } from '../Skill/SkillModel';

export interface Skillinfluence {
    skill: Skill,
    pickedScore: number,
    notPickedScore: number,
}

const SkillInfluenceSchema = new Schema<Skillinfluence>({
    skill: { type: SchemaTypes.ObjectId, ref: "Skill" },
    pickedScore: { type: Number, default: 1 },
    notPickedScore: { type: Number, default: -1 }
})


export default model<Skillinfluence>("SkillInfluence", SkillInfluenceSchema);

