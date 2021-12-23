import AnswerOptionModel from '@models/AnswerOption/AnswerOptionModel';
import JobModel from '@models/Job/JobModel';
import QuestionModel from '@models/Question/QuestionModel';
import SkillModel from '@models/Skill/SkillModel';
import express from 'express';
import inferenceEngine from 'services/inferenceEngine';

class InferenceHandler {

    dynamicInferenceEngine: express.Handler = async (req, res, next) => {
        const body = req.body;
        if (!body.options) delete req.session.inQuizz
        let current = req.session.inQuizz!;
        let response: any;

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
                "compareBoth": "",
                "sessionFinished": false
            };
            response = await inferenceEngine.getFirstQuestion();
            // inferenceEngine.calculateScore(req, current);
            return res.json({ ...response, stage: "tasks" })
        } else {
            current.answeredQuestions += 1;
            current.stage = "tasks";
            if (current.answeredQuestions === 1) {
                response = await inferenceEngine.getSecondQuestion(req, current);
                await inferenceEngine.calculateScore(req, current);

                // response['stage'] = "tasks";
            } else if (current.answeredQuestions === 2) {
                response = await inferenceEngine.getThirdQuestion(req, current);
                await inferenceEngine.calculateScore(req, current);
            } else if (current.answeredQuestions === 3) {
                await inferenceEngine.calculateScore(req, current, true);
                response = await inferenceEngine.getFourthQuestion(req, current);
            } else if (current.answeredQuestions === 4) {
                await inferenceEngine.calculateScore(req, current);
                response = await inferenceEngine.getFifthQuestion(req, current);
            } else if (current.answeredQuestions === 5) {
                await inferenceEngine.calculateScore(req, current);
                response = await inferenceEngine.getSixthQuestion(req, current);
            } else if (current.answeredQuestions === 6) {
                await inferenceEngine.calculateScore(req, current);
                response = await inferenceEngine.getSeventQuestion(req, current);
            } else if (current.answeredQuestions === 7) {
                await inferenceEngine.calculateScore(req, current);
                response = await inferenceEngine.getEightQuestion(req, current);
            } else if (current.answeredQuestions === 8) {
                current['stage'] = 'personality';
                await inferenceEngine.calculateScore(req, current);
                response = await inferenceEngine.getNinethQuestion(req, current);
                const remainingAmountPersQuestion = current['personality'].length;
                const remainingAmountCompQuestion = current['competences'].length;
                console.log(current['personality'].length);
                console.log(current['competences'].length);
                response['personalityQuestionsAmount'] = remainingAmountPersQuestion
                response['competencesQuestionsAmount'] = remainingAmountCompQuestion
            } else {
                await inferenceEngine.calculateScore(req, current);
                const remainingAmountPersQuestion = current['personality'].length;
                const remainingAmountCompQuestion = current['competences'].length;
                if (remainingAmountPersQuestion > 0) {
                    current['stage'] = "personality";
                    const randomNumber = Math.round(Math.random() * (current['personality'].length - 1));

                    const dbQuestion = current['personality'].splice(randomNumber, 1)[0];
                    response = inferenceEngine.transformQuestion(dbQuestion);
                } else if (remainingAmountCompQuestion > 0) {
                    current['stage'] = "competences";
                    const randomNumber = Math.round(Math.random() * (current['competences'].length) - 1);
                    const dbQuestion = current['competences'].splice(randomNumber, 1)[0];
                    response = inferenceEngine.transformQuestion(dbQuestion);
                } else {
                    current['stage'] = 'competences';
                    response = inferenceEngine.getUserFinalJobScores(current);
                    response['sessionFinished'] = true;
                }
            }


            return res.json({ ...response, stage: current.stage });
        }

    }




}

export default new InferenceHandler();