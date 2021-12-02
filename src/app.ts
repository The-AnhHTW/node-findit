
import express from 'express';
import apiRouter from './routes/apiRouter';
import MailSender from './services/MailSender';

const app: express.Application = express();

// configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', apiRouter)


// MailSender.sendMail("the-anh.nguyen@hotmail.de", "Registrierung", "LAK SHU", '<h2>HAHAHAHA</h2>').then((resp) => {
//     console.log({ resp });
// }).catch((err) => {
//     console.log({ err })
// })


export default app;
