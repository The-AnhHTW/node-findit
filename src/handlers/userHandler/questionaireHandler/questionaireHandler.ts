import QuestionaireModel from '@models/Questionaire/QuestionaireModel';
import SurveyModel from '@models/Survey/SurveyModel';
import UserModel from '@models/User/UserModel';
import express from 'express';
import inferenceHandler from 'handlers/inferenceHandler/inferenceHandler';
import { insertCancelledQuestionaire, insertValidQuestionaire, updateValidRow } from '../../../../server';

class QuestionaireHandler {

    saveQuestionaire: express.Handler = async (req, res, next) => {
        let results = [];

        const questoinaire = ((body) => {
            const notIncluded = ['sessionFinished', 'stage'];
            const result: any = {};
            const answerHistory: any[] = body['answerHistory'];
            for (const key in body) {
                if (notIncluded.includes(key) || key === 'answerHistory') continue;
                result[key] = body[key];
                results.push({ job: key, ...body[key] });
            }
            return { result, answerHistory };
        })(req.body)
        const dbQuestionaire = new QuestionaireModel(questoinaire);
        await dbQuestionaire.save();


        await insertValidQuestionaire(
            {
                questionaire_id: dbQuestionaire._id,
                answerHistory: JSON.stringify(questoinaire.answerHistory.map(({ question, responseTime }) => ({ question, responseTime })), null, "\t"),
                job_1: JSON.stringify(results[0], null, "\t"),
                job_2: JSON.stringify(results[1], null, "\t"),
                job_3: JSON.stringify(results[2], null, "\t"),
                survey: null,
                finished: true
            }
        );


        if (req.user) {
            const sessUser: any = req.user;
            const dbUser = await UserModel.findById(sessUser._id);
            dbUser?.questionaires.push(dbQuestionaire._id);
            await dbUser?.save();
        }
        return res.json({ questionaire_id: dbQuestionaire._id })
    }

    getQuestionaireFromLoggedInUser: express.Handler = async (req, res, next) => {
        const sessUser: any = req.user;
        if (sessUser) {
            const dbUser = await UserModel.findById(sessUser._id).populate({
                path: 'questionaires',
                populate: {
                    path: 'survey'
                }
            });
            return res.json(dbUser?.questionaires)
        }

        return res.status(500).json({ message: "Error occured retry later!" });

    }

    saveSurvey: express.Handler = async (req, res, next) => {
        const { questionaire_id } = req.body;
        delete req.body['questionaire_id'];

        const dbQuestionaire = await QuestionaireModel.findById(questionaire_id).populate('survey');
        let survey;
        if (!dbQuestionaire.survey) {
            survey = new SurveyModel(req.body);
            survey.save();
        } else {
            survey = dbQuestionaire.survey;
            survey = await SurveyModel.findOneAndUpdate(survey._id, req.body);
        }

        dbQuestionaire.survey = survey?._id;
        dbQuestionaire.save();

        updateValidRow(questionaire_id, { survey: JSON.stringify(survey, null, "\t") })


        return res.status(204).send();
    }

    cancelQuestionaire: express.Handler = async (req, res, next) => {
        if (req.session.inQuizz) {
            let copy = { ...req.session.inQuizz };
            if (copy.answeredQuestions > 0) {
                console.log("saving canceled questionaire for statistic purposes.")
                new QuestionaireModel({
                    answerHistory: copy.answerHistory,
                    survey: null,
                    result: null,
                    finished: false,
                }).save();

                await insertCancelledQuestionaire({
                    questionaire_id: null,
                    answerHistory: JSON.stringify(copy.answerHistory.map(({ question, responseTime }) => ({ question, responseTime })), null, "\t"),
                    job_1: null,
                    job_2: null,
                    job_3: null,
                    survey: null,
                    finished: false
                });





            }


        }
        inferenceHandler.removeSessionJob(req, true);
        return res.json({ message: "Deleting session for memory management" });
    }
}

export default new QuestionaireHandler();