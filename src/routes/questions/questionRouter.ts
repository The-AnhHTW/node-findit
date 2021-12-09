
import express from 'express';
import questionHandler from 'handlers/questionHandler.ts/questionHandler';
const questionRouter = express.Router();
questionRouter.get('/', questionHandler.getQuestions);


export default questionRouter;