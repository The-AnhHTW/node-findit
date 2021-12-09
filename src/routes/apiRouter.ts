import express from 'express';
import authRouter from './authRouter/authRouter';
import questionRouter from './questions/questionRouter';
import userRouter from './users/userRouter';

const apiRouter = express.Router();

// apiRouter.get('/', (req,res,next) => res.json("JOJO"))
apiRouter.use(authRouter);
apiRouter.use('/questions', questionRouter);
apiRouter.use('/users', userRouter);








export default apiRouter;
