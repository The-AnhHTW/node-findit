
import express from 'express';
import questionHandler from 'handlers/questionHandler.ts/questionHandler';
import questionaireRouter from './questionaireRouter';
const userRouter = express.Router();

userRouter.use('/questionaires', questionaireRouter);

export default userRouter;