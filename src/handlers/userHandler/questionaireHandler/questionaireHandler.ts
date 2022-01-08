import QuestionaireModel from '@models/Questionaire/QuestionaireModel';
import UserModel from '@models/User/UserModel';
import express from 'express';

class QuestionaireHandler {

    saveQuestionaire: express.Handler = async (req, res, next) => {
        if (req.user) {
            const questoinaire = ((body) => {
                const notIncluded = ['sessionFinished', 'stage'];
                const result: any = {};
                const answerHistory = body['answerHistory'];
                for (const key in body) {
                    if (notIncluded.includes(key) || key === 'answerHistory') continue;
                    result[key] = body[key];
                }
                return { result, answerHistory };
            })(req.body)

            const dbQuestionaire = new QuestionaireModel(questoinaire);
            await dbQuestionaire.save();
            const sessUser: any = req.user;
            const dbUser = await UserModel.findById(sessUser._id);
            dbUser?.questionaires.push(dbQuestionaire._id);
            await dbUser?.save();
            return res.status(204).send();
        }

        return res.status(500).json({ message: "Error occured retry later!" });


    }

    getQuestionaireFromLoggedInUser: express.Handler = async (req, res, next) => {
        const sessUser: any = req.user;
        if (sessUser) {
            const dbUser = await UserModel.findById(sessUser._id).populate('questionaires');
            console.log(dbUser)
            return res.json(dbUser?.questionaires)
        }

        return res.status(500).json({ message: "Error occured retry later!" });

    }

}

export default new QuestionaireHandler();