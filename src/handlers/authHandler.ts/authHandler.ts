import AnswerOptionModel from '@models/AnswerOption/AnswerOptionModel';
import EmailTokenModel from '@models/EmailToken/EmailTokenModel';
import JobModel from '@models/Job/JobModel';
import QuestionModel from '@models/Question/QuestionModel';
import SkillModel from '@models/Skill/SkillModel';
import UserModel from '@models/User/UserModel';
import express, { urlencoded } from 'express';
import passport from 'passport';
import MailSender from 'services/MailSender';

class AuthHandler {

    login: express.Handler = (req, res, next) => {
        return passport.authenticate('local', (err, user, message) => {
            if (err) return next(err);
            if (!user) return next({ status: 401, message })
            if (!user.isActive) return next({ message: `You have to confirm your email first!` });
            req.logIn(user, () => {
                return res.json(user);
            })
        })(req, res, next)
    }

    logout: express.Handler = (req, res, next) => {
        req.logOut();
        return res.json({ message: "logged out" });
    }

    register: express.Handler = async (req, res, next) => {
        const { email, password, name } = req.body;
        if (!email || !password || !name) return next({ status: 400, message: `Missing parameters $username $email $password $name` })
        const newUser = new UserModel({ isActive: false, email, password, name });
        const emailToken = new EmailTokenModel({ user: newUser._id });
        return Promise.all([emailToken.save(),
        newUser.save()]).then(() => {
            MailSender.sendMail(email, "Anmeldung an FindIT", "", `<a href='http://localhost:8000/api/confirm/${emailToken._id}'>Klicken zum registrieren</a>`)
            return res.json({ message: "Sie haben Anweisungen per Mail bekommen, um ihren Account zu registrieren" });
        }).catch((err) => {
            if (err.code === 11000) {
                err.message = 'Email already taken!'
                err.status = 400;
            }
            next(err)
        })

    }

    confirmRegister: express.Handler = async (req, res, next) => {
        return EmailTokenModel.findById(req.params.id).then(async (token) => {
            console.log({ token })
            if (!token) return next({ status: 404, message: "No token found!" });

            return UserModel.findOneAndUpdate({ _id: token.user }, { isActive: true })

        }).then(() => {
            return EmailTokenModel.findByIdAndDelete(req.params.id)
        }).then(() => {
            return res.json(`User is now activated!`);
        })
            .catch((err) => next(err))
    }


}

export default new AuthHandler();