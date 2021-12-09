import dotenv from 'dotenv';
dotenv.config();
import app from './src/app';
import mongoose, { mongo } from 'mongoose';
const PORT = process.env.PORT || 8000;
const mongo_uri = process.env.MONGO_DB_URI;

mongoose.connect(mongo_uri!, {
    dbName: "findit"
}).then(() => {

app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));
}).
    catch((err) => {
        console.log({ err })
    })





