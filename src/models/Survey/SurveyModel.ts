import { model, Model, Schema, SchemaTypes } from "mongoose";

interface Survey {
    birth_year: number,
    sex: string,
    occupation: string,
    reason: string,
    job_title?: string,
    experience_in_years?: string,
    rating?: number,
}




export const SurveySchema = new Schema<Survey>({
    birth_year: Number,
    sex: String,
    occupation: String,
    job_title: String,
    experience_in_years: String,
    reason: String,
    rating: Number
},
    {
        timestamps: {
            createdAt: 'created_at', updatedAt: 'updated_at'
        },
    })


export default model<Survey>('Survey', SurveySchema);

