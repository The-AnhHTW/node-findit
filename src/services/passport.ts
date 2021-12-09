import UserModel from "@models/User/UserModel";
import passport from "passport";
import LocalStrategy from 'passport-local';
import { comparePassword } from "./hasher";

passport.use(new LocalStrategy.Strategy({ usernameField: 'email' }, (username, password, done) => {
    UserModel.findOne({ email: username }).then(async (user) => {
        if (!user) return done(null, false, { message: "Username or password wrong" })
        if (!(await comparePassword(password, user.password))) return done(null, false, { message: "Username or password wrong" });
        return done(null, { ...user.toObject(), password: undefined })
    })
}))

passport.serializeUser(function (user: any, done) {
    done(null, user._id);
});

passport.deserializeUser(function (id, done) {
    UserModel.findById(id, function (err: any, user: any) {
        done(err, user);
    });
});