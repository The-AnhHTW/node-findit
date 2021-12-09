
import express from 'express';
import authHandler from 'handlers/authHandler.ts/authHandler';
// import questionHandler from 'handlers/questionHandler.ts/questionHandler';
const authRouter = express.Router();
authRouter.post('/login', authHandler.login)
authRouter.post('/register', authHandler.register);
authRouter.get('/confirm/:id', authHandler.confirmRegister);
authRouter.get('/logout', authHandler.logout);
// authRouter

// userRouter.get('/', questionHandler.getQuestions);


export default authRouter;