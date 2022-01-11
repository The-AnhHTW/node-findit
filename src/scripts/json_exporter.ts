require('@models/Survey/SurveyModel');
require('@models/Questionaire/QuestionaireModel');
require('@models/JobInfluence/JobInfluenceModel');
require('@models/AnswerOption/AnswerOptionModel');
require('@models/Job/JobModel');
require('@models/SkillInfluence/SkillInfluenceModel');
require('@models/Skill/SkillModel');
require('@models/User/UserModel');

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
}).then(async () => {

    let allQuestions = await QuestionModel.find({}).populate({
        path: 'answerOptions',
        populate: {
            path: 'jobInfluences',
            populate: [{
                path: 'skillInfluences',
                populate: {
                    path: 'skill',
                    populate: {
                        path: 'job'
                    }
                }
            }, { path: 'job' }]
        }
    });

    let newQuestions = allQuestions.map(({ questionType,question, questionMeasure, stageQuestion, answerOptions }) =>
    ({
        questionType, questionMeasure, stageQuestion,question,
        answerOptions: answerOptions.map(({ labels, jobInfluences, text }) => ({
            labels,
            text,
            jobInfluences: jobInfluences.map(({ job, pickedScore, notPickedScore, skillInfluences }) =>
            (({
                job: job.abbreviation,
                pickedScore,
                notPickedScore,
                skillInfluences: skillInfluences.map(({ skill, pickedScore, notPickedScore }) => ({
                    pickedScore,
                    notPickedScore,
                    skill: skill.skill

                }))

            }))

            )


        }))
    }))

    let tasksQuestions = newQuestions.filter((question) => question.stageQuestion);
    let personalityQuestions = newQuestions.filter((question) => question.questionMeasure === 'Personality');
    let competencesQuestions = newQuestions.filter((question) => question.questionMeasure === 'Competences');


    fs.writeFile('./Questions/tasksQuestions.json', JSON.stringify(tasksQuestions), 'utf-8', () => {
        fs.writeFile('./Questions/personalityQuestions.json', JSON.stringify(personalityQuestions), 'utf-8', () => [
            fs.writeFile('./Questions/competencesQuestions.json', JSON.stringify(competencesQuestions), 'utf-8', () => {
                return process.exit();
            })
        ])


    });



})

