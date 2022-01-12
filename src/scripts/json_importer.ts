require('@models/Survey/SurveyModel');
require('@models/Questionaire/QuestionaireModel');
require('@models/JobInfluence/JobInfluenceModel');
require('@models/AnswerOption/AnswerOptionModel');
require('@models/Job/JobModel');
require('@models/SkillInfluence/SkillInfluenceModel');
require('@models/Skill/SkillModel');
require('@models/User/UserModel');

// import Questions from './Question/Question.json';
// import AnswerOptions from './AnswerOption/AnswerOption.json';
// import JobInfluences from './JobInfluence/JobInfluence.json';
// import Skills from './Skill/Skill.json';
// import SkillInfluences from './SkillInfluence/SkillInfluence.json';
// import Jobs from './Job/Job.json';

import Jobs from './Jobs/jobs.json';
import HardSkills from './Skills/hardSkills.json';
import SoftSkills from './Skills/softSkills.json';
import TaskSkills from './Skills/taskSkills.json';
import PersonalitySkills from './Skills/personalitySkills.json';
import personalityQuestions from './Questions/personalityQuestions.json';
import tasksQuestions from './Questions/tasksQuestions.json';
import competencesQuestions from './Questions/competencesQuestions.json';

import QuestionModel, { Question, QuestionMeasure, QuestionType } from '@models/Question/QuestionModel';
import AnswerOptionModel, { AnswerOption, AnswerOptionSchema } from '@models/AnswerOption/AnswerOptionModel';
import JobInfluenceModel, { JobInfluence } from '@models/JobInfluence/JobInfluenceModel';
import SkillModel, { Skill } from '@models/Skill/SkillModel';
import SkillInfluenceModel, { Skillinfluence } from '@models/SkillInfluence/SkillInfluenceModel';
import JobModel, { Job } from '@models/Job/JobModel';
import mongoose from 'mongoose';
import fs from 'fs';

const mongo_uri = 'mongodb://admin:12345@localhost:27017';


mongoose.connect(mongo_uri!, {
    dbName: "findit"
}).then(() => {
    Promise.all(
        [
            //Deleeting all previous models
            SkillModel.remove({}),
            JobModel.remove({}),
            QuestionModel.remove({}),
            SkillModel.remove({}),
            SkillInfluenceModel.remove({}),
            JobInfluenceModel.remove({})
        ]
    ).then(async () => {
        // Skills and Jobs insertion into DB
        await JobModel.insertMany(Jobs);
        const dbJobs = await JobModel.find({});
        await SkillModel
            .insertMany([...HardSkills, ...SoftSkills, ...PersonalitySkills, ...TaskSkills].map(({ skill, job, skillCategory }) => ({ skill, skillCategory, job: dbJobs.find((dbJob) => dbJob.abbreviation === job) })))
        const dbSkills = await SkillModel.find({});

        // insertion of Questions, AnswerOptions, JobInfluences and SkillInfluences
        let questionPromises = []
        for (const jsonQuestion of [...tasksQuestions, ...personalityQuestions, ...competencesQuestions]) {
            questionPromises.push(QuestionModel.create((
                ({ question,
                    questionMeasure,
                    stageQuestion,
                    questionType }) => ({
                        questionMeasure, question, stageQuestion, questionType
                    }))(jsonQuestion)).then(async (dbQuestion) => {
                        let answerOptionPromises = [];
                        for (const answerOption of jsonQuestion.answerOptions) {
                            answerOptionPromises.push(AnswerOptionModel.create(
                                //@ts-ignore
                                (({ labels, text }) => ({ labels, text }))(answerOption)
                            ).then(async (dbAnswerOption) => {
                                let jobIPromises = [];
                                for (const JobInfluence of answerOption.jobInfluences) {
                                    jobIPromises.push(JobInfluenceModel.create(
                                        (({ pickedScore, notPickedScore, job, }) => ({
                                            pickedScore, notPickedScore,
                                            job: dbJobs.find(dbJob => job === dbJob.abbreviation)
                                        }))(JobInfluence)
                                    ).then(async (dbJobInfluence) => {
                                        let skillIPromises = []
                                        for (const SkillInfluence of JobInfluence.skillInfluences) {
                                            skillIPromises.push(SkillInfluenceModel.create(
                                                (({ pickedScore, notPickedScore, skill }) =>
                                                    ({ pickedScore, notPickedScore, skill: dbSkills.find(dbSkill => dbSkill.skill === skill) }))(SkillInfluence)
                                            ))
                                        }
                                        dbJobInfluence.skillInfluences = (await Promise.all(skillIPromises)).map((dbSkill) => dbSkill._id);
                                        return dbJobInfluence.save();
                                    }))
                                }
                                dbAnswerOption.jobInfluences = (await Promise.all(jobIPromises)).map((dbJobI) => dbJobI._id);
                                return dbAnswerOption.save();
                            }))
                        }
                        dbQuestion.answerOptions = (await Promise.all(answerOptionPromises)).map((dbAnswerOption) => dbAnswerOption._id);
                        return dbQuestion.save();
                    }))

        }
        return Promise.all(questionPromises);
    }).then(async () => {
        process.exit();
    }).catch(async (err) => {
    });
})