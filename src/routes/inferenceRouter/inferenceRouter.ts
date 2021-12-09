
import express from 'express';
import authHandler from 'handlers/authHandler.ts/authHandler';
import inferenceHandler from 'handlers/inferenceHandler/inferenceHandler';
// import questionHandler from 'handlers/questionHandler.ts/questionHandler';
const inferenceRouter = express.Router();

inferenceRouter.post('/dynamicInference', inferenceHandler.dynamicInferenceEngine);

// authRouter

// userRouter.get('/', questionHandler.getQuestions);


export default inferenceRouter;