import AnswerOptionModel from '@models/AnswerOption/AnswerOptionModel';
import JobModel from '@models/Job/JobModel';
import QuestionModel from '@models/Question/QuestionModel';
import SkillModel from '@models/Skill/SkillModel';
import express from 'express';

class QuestionHandler {

    getQuestions: express.Handler = (req, res, next) => {
        return QuestionModel.find({}).populate('answerOptions').then((response) => {
            return res.json(response);
        }).catch((err) => next(err))
    }

}

export default new QuestionHandler();