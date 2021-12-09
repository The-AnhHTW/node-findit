import mongoose, { Schema, model } from 'mongoose';
import { isEmail } from 'utils/utility';

export interface User {
    isActive: boolean,
    name: string,
    email: string,
    role: string,
    password: string
}


const UserSchema = new Schema<User>({
    isActive: Boolean,
    name: String,
    email: {
        type: String,
        unique: true,
        validate:{
            validator: (v:any) =>{
                return isEmail(v);
            },
            message:"Not a valid email!"
        }
    },
    role: String,
    password: String,
})

export default model<User>('User', UserSchema);

