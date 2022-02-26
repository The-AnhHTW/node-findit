import AnswerOptionModel from '@models/AnswerOption/AnswerOptionModel';
import JobModel from '@models/Job/JobModel';
import QuestionModel from '@models/Question/QuestionModel';
import SkillModel from '@models/Skill/SkillModel';
import express from 'express';
import inferenceEngine from 'services/inferenceEngine';
import { SimpleIntervalJob, Task, ToadScheduler } from 'toad-scheduler';

const scheduler = new ToadScheduler()

class InferenceHandler {

    mapper = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eight', 'Nineth'];

    dynamicInferenceEngine: express.Handler = async (req, res, next) => {
        const body = req.body;
        if (!body.options) delete req.session.inQuizz
        let current = req.session.inQuizz!;
        let response: any;
        if (!current) {
            req.session.history = [];
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
                "answerHistory": [],
                "startTime": 0,
                "endTime": 0,
                "deleteNotNeededSkills": []
            };
            response = await inferenceEngine.getZerothQuestion();

            req.session.inQuizz.startTime = Date.now();
            current = req.session.inQuizz;
            // return res.json({ ...response, stage: "tasks" })
        } else {
            current.endTime = Date.now();
            current.answeredQuestions += 1;
            current.stage = "tasks";
            const currentNumber = current.answeredQuestions - 1;
            let key = `get${this.mapper[currentNumber]}Question`;
            switch (currentNumber) {
                case 0: case 1: case 2: {
                    //@ts-ignore
                    response = await inferenceEngine[key](req, current);
                    // Filter out only the picked ones, so that so that the max_score does not increase
                    req.body['options'] = req.body['options'].filter((item: any) => item.picked)
                    // response = await inferenceEngine.getSecondQuestion(req, current);
                    await inferenceEngine.calculateScore(req, current, false, currentNumber);
                    break;
                } case 3: {
                    // Filter out only the picked ones, so that so that the max_score does not increase
                    req.body['options'] = req.body['options'].filter((item: any) => item.picked)
                    await inferenceEngine.calculateScore(req, current, true, currentNumber);
                    //@ts-ignore
                    response = await inferenceEngine[key](req, current);
                    break;
                }
                case 4: case 5: case 6: case 7: {
                    await inferenceEngine.calculateScore(req, current, false, currentNumber);
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
                        // const randomNumber = Math.round(Math.random() * (current['personality'].length - 1));
                        // const dbQuestion = current['personality'].splice(randomNumber, 1)[0];
                        const dbQuestion = current['personality'].pop();
                        response = inferenceEngine.transformQuestion(dbQuestion);
                    } else if (remainingAmountCompQuestion > 0) {
                        current['stage'] = "competences";
                        // const randomNumber = Math.round(Math.random() * (current['competences'].length) - 1);
                        // const dbQuestion = current['competences'].splice(randomNumber, 1)[0];
                        const dbQuestion = current['competences'].pop();
                        response = inferenceEngine.transformQuestion(dbQuestion);
                    } else {
                        current['stage'] = 'competences';
                        response = { ...inferenceEngine.getUserFinalJobScores(current) };
                        response['sessionFinished'] = true;
                        response['answerHistory'] = current['answerHistory']
                        delete req.session.inQuizz;
                        delete req.session.history;
                    }
                }
            }

        }
        if (req.session.inQuizz) req.session.history!.push({ ...req.session.inQuizz })
        // remove session after 15 min
        scheduler.removeById(req.sessionID);
        this.removeSessionJob(req);
        current.startTime = Date.now();
        return res.json({ ...response, stage: current.stage });

    }

    goBackOneQuestion: express.Handler = async (req, res, next) => {
        const history = req.session.history!;
        const index = history.length - 3;
        const lastState = history[index];
        console.log({ index, length: history.length });
        req.session.history = history.filter((_, currIndex) => currIndex <= index);


        if (!lastState) {
            req.session.history = [];
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
                "answerHistory": [],
                "startTime": 0,
                "endTime": 0,
                "deleteNotNeededSkills": []
            };
            let response = await inferenceEngine.getZerothQuestion();
            req.session.inQuizz.startTime = Date.now();
            req.session.history!.push({ ...req.session.inQuizz })
            return res.json({ ...response, stage: "tasks" });
        } else {
            req.session.inQuizz = { ...lastState };
            return res.redirect(307, '/api/dynamicInference')
        }
    }






    removeSessionJob = (req: any, runImmediately = false) => {
        const sessionId = req.sessionID;
        const deleteSessionTask = new Task('delete Session task (10 min)', () => {
            console.log(`delete session with id: ${sessionId}`)
            req.session.destroy();
            scheduler.removeById(sessionId)
        })
        const job = new SimpleIntervalJob({ seconds: 60 * 15, runImmediately }, deleteSessionTask,
            sessionId,

        );
        scheduler.addSimpleIntervalJob(job)
    }






}

export default new InferenceHandler();