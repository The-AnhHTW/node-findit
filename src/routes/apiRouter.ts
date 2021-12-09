import express from 'express';
import authRouter from './authRouter/authRouter';
import inferenceRouter from './inferenceRouter/inferenceRouter';
import questionRouter from './questions/questionRouter';
import userRouter from './users/userRouter';

const apiRouter = express.Router();

// apiRouter.get('/', (req,res,next) => res.json("JOJO"))
apiRouter.use(authRouter);
apiRouter.use(inferenceRouter);
apiRouter.use('/questions', questionRouter);
apiRouter.use('/users', userRouter);








export default apiRouter;
