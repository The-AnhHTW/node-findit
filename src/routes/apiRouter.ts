import express from 'express';
import questionRouter from './questions/questionRouter';

const apiRouter = express.Router();

// apiRouter.get('/', (req,res,next) => res.json("JOJO"))
apiRouter.use('/questions', questionRouter);





export default apiRouter;
