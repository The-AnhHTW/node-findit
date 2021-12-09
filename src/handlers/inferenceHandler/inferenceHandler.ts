import AnswerOptionModel from '@models/AnswerOption/AnswerOptionModel';
import JobModel from '@models/Job/JobModel';
import QuestionModel from '@models/Question/QuestionModel';
import SkillModel from '@models/Skill/SkillModel';
import express from 'express';
import inferenceEngine from 'services/inferenceEngine';

class InferenceHandler {

    dynamicInferenceEngine: express.Handler = async (req, res, next) => {

        const body = req.body;
        const current = req.session.inQuizz!;
        let response: any;
        if (!body.options) req.session.inQuizz = undefined;
        if (!current) {
            req.session.inQuizz = {
                "currentJobScores": await inferenceEngine.getInitialJobScores(),
                "stage": "",
                "answeredQuestions": 0,
                "pickedOptions": [],
                "reserved": '',
                "highestJobs": [],
                "personality": [],
                "competences": [],
                "compareBoth": ""
            };
            response = await inferenceEngine.getFirstQuestion();
            // inferenceEngine.calculateScore(req, current);
            return res.json({ ...response, stage: "tasks" })
        } else {

            current.answeredQuestions += 1;
            current.stage = "tasks";
            if (current.answeredQuestions === 1) {
                response = await inferenceEngine.getSecondQuestion(req, current);
                inferenceEngine.calculateScore(req, current);
                console.log(current['currentJobScores']);
                // response['stage'] = "tasks";
            } else if (current.answeredQuestions === 2) {
                response = await inferenceEngine.getThirdQuestion(req, current);
                inferenceEngine.calculateScore(req, current);
            } else if (current.answeredQuestions === 3) {
                console.log(current["currentJobScores"])
                response = await inferenceEngine.getFourthQuestion(req, current);
                inferenceEngine.calculateScore(req, current);
                // return res.json(current['currentJobScores'])
            }


            return res.json({ ...response, stage: current.stage });
        }

    }




}

export default new InferenceHandler();