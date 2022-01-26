
import express from 'express';
import questionaireHandler from 'handlers/userHandler/questionaireHandler/questionaireHandler';
// import questionHandler from 'handlers/questionHandler.ts/questionHandler';
const questionaireRouter = express.Router();

questionaireRouter.post('/', questionaireHandler.saveQuestionaire);
questionaireRouter.post('/cancel', questionaireHandler.cancelQuestionaire)
questionaireRouter.get('/', questionaireHandler.getQuestionaireFromLoggedInUser);
questionaireRouter.post('/survey', questionaireHandler.saveSurvey);

// questionaireRouter.get('/');


export default questionaireRouter;