import AnswerOptionModel from '@models/AnswerOption/AnswerOptionModel';
import JobModel from '@models/Job/JobModel';
import QuestionModel from '@models/Question/QuestionModel';
import SkillModel from '@models/Skill/SkillModel';
import express from 'express';
import inferenceEngine from 'services/inferenceEngine';

class InferenceHandler {

    mapper = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eight', 'Nineth']

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
                "sessionFinished": false,
                "answerHistory": []
            };
            response = await inferenceEngine.getZerothQuestion();
            // inferenceEngine.calculateScore(req, current);
            return res.json({ ...response, stage: "tasks" })
        } else {
            current.answeredQuestions += 1;
            current.stage = "tasks";
            const currentNumber = current.answeredQuestions - 1;
            let key = `get${this.mapper[currentNumber]}Question`;
            switch (currentNumber) {
                case 0: case 1: case 2: {
                    console.log(currentNumber)
                    //@ts-ignore
                    response = await inferenceEngine[key](req, current);
                    // response = await inferenceEngine.getSecondQuestion(req, current);
                    await inferenceEngine.calculateScore(req, current);
                    break;
                }
                case 3: case 4: case 5: case 6: case 7: {
                    await inferenceEngine.calculateScore(req, current, currentNumber === 3);
                    //@ts-ignore
                    response = await inferenceEngine[key](req, current);
                    break;
                }
                case 8: {
                    current['stage'] = 'personality';
                    await inferenceEngine.calculateScore(req, current);
                    response = await inferenceEngine.getNinethQuestion(req, current);
                    const remainingAmountPersQuestion = current['personality'].length;
                    const remainingAmountCompQuestion = current['competences'].length;
                    response['personalityQuestionsAmount'] = remainingAmountPersQuestion
                    response['competencesQuestionsAmount'] = remainingAmountCompQuestion
                    break;
                }
                default: {
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
                        response['answerHistory'] = current['answerHistory']
                    }
                }
            }
            return res.json({ ...response, stage: current.stage });
        }

    }




}

export default new InferenceHandler();