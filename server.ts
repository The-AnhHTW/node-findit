import dotenv from 'dotenv';
dotenv.config();
import app from './src/app';
import mongoose, { mongo } from 'mongoose';
const PORT = process.env.PORT || 8000;
const mongo_uri = process.env.MONGO_DB_URI;

import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';



mongoose.connect(mongo_uri!, {
    dbName: "findit"
}).then(() => {

    app.listen(PORT, () => console.log(`listening on PORT ${PORT}`));
}).
    catch((err) => {
        console.log({ err })
    })




const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err: any, content: string) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), listMajors);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials: { installed: { client_secret: any; client_id: any; redirect_uris: any; }; }, callback: { (auth: any): void; (arg0: any): void; }) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err: any, token: string) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client: { generateAuthUrl: (arg0: { access_type: string; scope: string[]; }) => any; getToken: (arg0: any, arg1: (err: any, token: any) => void) => void; setCredentials: (arg0: any) => void; }, callback: (arg0: any) => void) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code: any) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err: any) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */

let doc: GoogleSpreadsheet;
let sheet: GoogleSpreadsheetWorksheet;
let cancelSheet: GoogleSpreadsheetWorksheet;

async function listMajors(auth: any) {
    const sheets = google.sheets({ version: 'v4', auth });
    doc = new GoogleSpreadsheet('1vB8WltWMn4rsA0YiT9dEKdNpugo5Ee7eKCbkJnZrBPo')
    doc.useOAuth2Client(auth);
    await doc.loadInfo(); // loads document properties and worksheets
    await doc.updateProperties({ title: 'Antwort Formular' });
    sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    cancelSheet = doc.sheetsByIndex[1];
    sheet.setHeaderRow(['questionaire_id', 'answerHistory', 'job_1', 'job_2', 'job_3', 'survey', 'finished'])
    cancelSheet.setHeaderRow(['questionaire_id', 'answerHistory', 'job_1', 'job_2', 'job_3', 'survey', 'finished'])
}

export async function insertValidQuestionaire(row: any) {
    await sheet.addRow(row);
}

export async function updateValidRow(questionaire_id: string, body: any) {
    const rows = await sheet.getRows();
    let selectedRow = rows.find((row) => row.questionaire_id === questionaire_id)!;
    // console.log({ selectedRow })

    selectedRow.survey = body['survey']
    await selectedRow.save();
}



export async function insertCancelledQuestionaire(row: any) {
    await cancelSheet.addRow(row);
}









