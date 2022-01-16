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

const mongo_express = require('mongo-express/lib/middleware')
const mongo_express_config = require('../mongo_config');
// console.log(mongo_express_config)
const mw = mongo_express(mongo_express_config);
// console.log(mw);
mw.then((resolve: any) => {
    apiRouter.use('/db', resolve)
    console.log("mounted mongoexpress")
}).catch((err: any
) => {
    console.log({ err })
})






export default apiRouter;
