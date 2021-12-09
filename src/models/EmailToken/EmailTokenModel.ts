import { User } from "@models/User/UserModel";
import { model, Schema, SchemaTypes } from "mongoose";


interface EmailToken {
    user: User,
}

const EmailTokenSchema = new Schema<EmailToken>({
    user: { type: SchemaTypes.ObjectId, ref: "User" }
})

export default model<EmailToken>('EmailToken', EmailTokenSchema);