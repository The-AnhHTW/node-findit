import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    isActive: String,
    name: String,
    email: String,
    role: String,
    password: String, 
})


class UserModel { 
    


}


export default new UserModel();