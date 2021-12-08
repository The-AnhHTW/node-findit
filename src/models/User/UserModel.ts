import mongoose, { Schema, model } from 'mongoose';

interface User {
    isActive: boolean,
    name: string,
    email: string,
    role: string,
    password: string
}


const UserSchema = new Schema<User>({
    isActive: Boolean,
    name: String,
    email: String,
    role: String,
    password: String, 
})

export default model<User>('User', UserSchema);

