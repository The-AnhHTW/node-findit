import mongoose, { model, Schema } from 'mongoose';


export enum JobEnum {
    SD = "Software Developer:in",
    BA = "Buiseness Analyst:in",
    IC = "IT-Consultant:in",
    DA = "Data Architect:in",
    PM = "Project Manager:in",
    ST = "Software Tester:in",
    SA = "System Administrator:in",
    FD = "Frontend Developer:in",
    ITC= "IT-Security Specialist:in"
}

export interface Job{
    title: string
    abbreviation: string,
}


const JobSchema = new Schema<Job>({
    abbreviation: String,
    title: String
}) 

export default model<Job>('Job', JobSchema)

// export default new JobModel();