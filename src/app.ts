
import express from 'express';
import passport from 'passport';
import apiRouter from './routes/apiRouter';
import MailSender from './services/MailSender';
import session from 'express-session';
const cors = require('cors');

require('@models/Survey/SurveyModel');
require('@models/Questionaire/QuestionaireModel');
require('@models/JobInfluence/JobInfluenceModel');
require('@models/AnswerOption/AnswerOptionModel');
require('@models/Job/JobModel');
require('@models/SkillInfluence/SkillInfluenceModel');
require('@models/Skill/SkillModel');
require('@models/User/UserModel');

declare module 'express-session' {
    interface SessionData {
        inQuizz?: {
            "currentJobScores": { [key: string]: any },
            "stage": string,
            "answeredQuestions": number,
            "pickedOptions": any[],
            "reserved": '',
            "highestJobs": any[],
            "personality": any[],
            "competences": any[],
            "compareBoth": "",
            "sessionFinished": boolean,
            "answerHistory": any[]
        }
    }
}

const app: express.Application = express();

// configuration

app.use(cors({
    credentials: true, origin: process.env.ORIGIN
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "dunno",
    saveUninitialized: true,
    // cookie: { secure: true }
}))
app.use(passport.initialize());
app.use(passport.session());
require('./services/passport')


// app.use(passport.session())
app.use('/api', apiRouter)



app.use(((err, req, res, next) => {
    return res.status(err.status || 500).json({ message: err.message || err.msg || err });
}) as express.ErrorRequestHandler)


// MailSender.sendMail("the-anh.nguyen@hotmail.de", "Registrierung", "LAK SHU", '<h2>HAHAHAHA</h2>').then((resp) => {
//     console.log({ resp });
// }).catch((err) => {
//     console.log({ err })
// })


export default app;
