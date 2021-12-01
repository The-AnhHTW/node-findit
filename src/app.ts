
import express from 'express';
import apiRouter from './routes/apiRouter';

const app: express.Application = express();

// configuration
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.use('/api', apiRouter)

export default app;
