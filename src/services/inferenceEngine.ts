import AnswerOptionModel, { AnswerOption } from "@models/AnswerOption/AnswerOptionModel";
import UserAnswerOptionModel from "@models/AnswerOption/UserAnswerOptionModel";
import JobModel from "@models/Job/JobModel";
import JobInfluenceModel from "@models/JobInfluence/JobInfluenceModel";
import QuestionModel, { Question } from "@models/Question/QuestionModel";
import express from 'express';


class InferenceEngine {


    calculateValueForQuestionType(value: number, dbQuestion: Question, dbOption: AnswerOption, option: any, type = "") {
        if (dbQuestion.questionType === 'Likert Scale') {
            const ranks = (dbOption.labels.length - 1);
            if (type === 'skill') {
                value = value - (option['rank'] / ranks)
            } else {
                value = value - ((option['rank'] / ranks) * value * 1.5)
            }
        } else if (dbQuestion.questionType === "Rank Order") {
            const penalizeFactor = value - (option['rank'] * (1 / 3) * value)
            // # not penalizing as hard as by LS.
            value = value * penalizeFactor
        }
        // console.log({ value })
        return value;
    }


    calculateScore = async (req: express.Request, current: any, reverse = false) => {
        const dbQuestion = await QuestionModel.findById(req.body['id']);

        let toHistory: {
            _id: string,
            question: string, answerOptions: any[]
        } = {
            _id: dbQuestion?.id!,
            question: dbQuestion!.question, answerOptions: []
        };

        for (const option of req.body['options']) {
            const dbOption = await AnswerOptionModel.findById(option['jobId']).populate({
                path: 'jobInfluences',
                populate: [
                    { path: 'job' },
                    {
                        path: 'skillInfluences',
                        populate: {
                            path: "skill"
                        }
                    }
                ]
            });


            toHistory.answerOptions.push({ _id: dbOption.id!, text: dbOption.text!, labels: dbOption.labels!, picked: option['picked']!, pickedRank: option['rank'] })
            for (const jobInfluence of dbOption.jobInfluences) {
                let value = option['picked'] ? jobInfluence.pickedScore : jobInfluence.notPickedScore;
                value = this.calculateValueForQuestionType(value, dbQuestion as Question, dbOption, option)
                if (reverse) {
                    value = value * (-1)
                }
                current['currentJobScores'][jobInfluence.job.abbreviation]['score'] += value;
                current['currentJobScores'][jobInfluence.job.abbreviation][dbQuestion!.questionMeasure.toLowerCase()]['score'] += value;
                for (const skillInfluence of jobInfluence.skillInfluences) {
                    let skillValue = option['picked'] ? skillInfluence.pickedScore : skillInfluence.notPickedScore;
                    skillValue = this.calculateValueForQuestionType(skillValue, dbQuestion as Question, dbOption, option, "skill")
                    current['currentJobScores'][jobInfluence.job.abbreviation]['skills'][skillInfluence.skill.skill]['score'] += skillValue;
                    current['currentJobScores'][jobInfluence.job.abbreviation]['skills'][skillInfluence.skill.skill]['max_score'] +=
                        Math.max(skillInfluence.pickedScore, skillInfluence.notPickedScore);
                }
            }
        }
        current['answerHistory'].push(toHistory);
    }

    getInitialJobScores = async () => {
        const jobs = await JobModel.find({});
        let jobScores: { [key: string]: any } = {}
        let questions = await (QuestionModel.find({})
            .populate({
                path: "answerOptions", populate: {
                    path: 'jobInfluences',
                    populate: [{
                        path: 'skillInfluences',
                        populate: {
                            path: "skill",

                        }
                    },
                    {
                        path: 'job'
                    }]
                }
            })
        )

        for (const job of jobs) {
            jobScores[job.abbreviation] = {
                "max_score": 0,
                "score": 0,
                "tasks": {
                    "max_score": 0,
                    "score": 0
                },
                "personality": {
                    "max_score": 0,
                    "score": 0
                },
                "competences": {
                    "max_score": 0,
                    "score": 0
                },
                "skills": {}
            }
        }

        for (const question of questions) {
            for (const answerOption of question.answerOptions) {
                for (const jobInfluence of answerOption.jobInfluences) {
                    const achievableScore = Math.max(jobInfluence.pickedScore, jobInfluence.notPickedScore);
                    const jobAbbrev = jobInfluence.job.abbreviation;
                    jobScores[jobAbbrev]["max_score"] += achievableScore;
                    jobScores[jobAbbrev][question.questionMeasure.toLowerCase()]["max_score"] += achievableScore;
                    for (const skillInfluence of jobInfluence.skillInfluences) {
                        if (!(skillInfluence.skill.skill in jobScores[jobAbbrev]['skills'])) {
                            jobScores[jobAbbrev]['skills'][skillInfluence.skill.skill] = {
                                max_score: 0,
                                score: 0
                            }
                        }
                        // jobScores[jobAbbrev]["skills"][skillInfluence.skill.skill][
                        //     'max_score'] += achievableScore;
                    }
                }
            }
        }



        return jobScores;
    }

    getFirstQuestion = async () => {
        return QuestionModel.findOne({ question: "Wähle 3 Aufgabenbereiche aus, die du am spannendsten findest" }).populate('answerOptions')
            .then((response) => this.transformQuestion(response));
    }

    getSecondQuestion = async (req: express.Request, current: any) => {
        const secondQuestion = await QuestionModel.findOne({ question: "Wähle erneut 3 Aufgabenbereiche aus, die du am spannendsten findest" }).populate("answerOptions")
            .then((response) => this.transformQuestion(response));
        for (const answerOption of req.body.options) {
            if (!answerOption['picked']) {
                const dbOption = await AnswerOptionModel.findOne({ _id: answerOption.jobId });
                secondQuestion['options'].push(this.transFormOption(dbOption));
            } else {
                current['pickedOptions'].push(answerOption)
            }
        }
        return secondQuestion;
    }

    getThirdQuestion = async (req: express.Request, current: any) => {
        const thirdQuestion = await QuestionModel.findOne({ question: "Wähle die beiden Aufgabenbereiche aus, die du am wenigsten spannend findest" })
            .populate("answerOptions")
            .then((response) => this.transformQuestion(response));
        for (const answerOption of req.body.options.concat(current['pickedOptions'])) {
            if (answerOption.picked) {
                const dbOption = await AnswerOptionModel.findOne({ _id: answerOption.jobId })
                thirdQuestion.options.push(this.transFormOption(dbOption))
            }
        }
        return thirdQuestion;
    }

    getFourHighestJobs(req: express.Request, current: any) {
        const jobs = JSON.parse(JSON.stringify(current['currentJobScores']));
        for (const key in jobs) {
            if (jobs[key]['score'] < 1) {
                // console.log(jobs[key]['score'])
                delete jobs[key]
            };
        }
        return Object.keys(jobs);
    }

    getFourthQuestion = async (req: express.Request, current: any) => {
        let fourthQuestion = await QuestionModel.findOne({ question: "Wie spannend findest du folgende Aufgaben? Bringe sie per Drag and Drop in eine Rangreihenfolge (ganz oben = spannendste)" })
            .populate("answerOptions")
            .then((response) => this.transformQuestion(response));

        current['highestJobs'] = this.getFourHighestJobs(req, current);
        const randomNumber = Math.round(Math.random() * 3);


        current['reserved'] = current['highestJobs'].splice(randomNumber, 1)[0];
        const toBeDeletedIndex: any[] = [];
        for (const option of fourthQuestion['options']) {
            const dbOption = await AnswerOptionModel.findOne({ _id: option.jobId }).populate({
                path: 'jobInfluences', populate: {
                    path: "job"
                }
            });
            const jobInfluences = dbOption.jobInfluences;
            for (const jobInfluence of jobInfluences) {
                if (!(current['highestJobs'].includes(jobInfluence.job.abbreviation))) {
                    toBeDeletedIndex.push(option.jobId);
                }
            }
        }
        fourthQuestion['options'] = fourthQuestion['options'].filter((option: any) => {
            return !(toBeDeletedIndex.includes(option.jobId))
        })
        return fourthQuestion;
    }

    getLowestJob = async (req: express.Request, current: any, excludeReserved = true) => {
        let supportedJobs = JSON.parse(JSON.stringify(current['highestJobs']));
        if (!excludeReserved) {
            supportedJobs.push(current['reserved'])
        }

        let jobScores = [];
        for (const job in current['currentJobScores']) {
            if (supportedJobs.includes(job)) {
                let jobScore = current['currentJobScores'][job];
                jobScore['id'] = job;
                jobScores.push(jobScore)
            }
        }
        return jobScores.sort((firstEl, secondEle) => firstEl['score'] > secondEle['score'] ? -1 : 1)[0]['id']
    }


    getFifthQuestion = async (req: express.Request, current: any) => {
        let fifthQuestion = await QuestionModel.findOne({ question: "Welche Aufgabe findest du spannender?" })
            .populate("answerOptions")
            .then((response) => this.transformQuestion(response));

        let compareBoth = [];
        compareBoth.push(await this.getLowestJob(req, current, current['currentJobScores']))
        compareBoth.push(current['reserved'])
        current['compareBoth'] = compareBoth.map((key) => ({ [key]: current['currentJobScores'][key] }));
        const toBeDeleted: any[] = []
        for (const option of fifthQuestion['options']) {
            const dbOption = await AnswerOptionModel.findOne({ _id: option.jobId }).populate({
                path: 'jobInfluences', populate: {
                    path: 'job'
                }
            });
            const jobInfluences = dbOption.jobInfluences;
            for (const jobInfluence of jobInfluences) {
                if (!compareBoth.includes(jobInfluence.job.abbreviation)) {
                    toBeDeleted.push(option['jobId']);
                }
            }
        }
        fifthQuestion['options'] = fifthQuestion['options'].filter((option: any) => !toBeDeleted.includes(option.jobId))
        return fifthQuestion;
    }

    getSixthQuestion = async (req: express.Request, current: any) => {
        let sixthQuestion = await QuestionModel.findOne({ question: "Wie spannend findest du folgende Aufgaben?" })
            .populate("answerOptions")
            .then((response) => this.transformQuestion(response))
        const lowestJob = await this.getLowestJob(req, current, false)
        if (current['highestJobs'].includes(lowestJob)) {
            current['highestJobs'] = current['highestJobs'].filter((job: any) => job != lowestJob)
            current['highestJobs'].push(current['reserved'])
        }
        const pickedJob = current['highestJobs'][0];
        const toBeDeleted: any[] = [];
        for (const option of sixthQuestion.options) {
            const dbOption = await AnswerOptionModel.findOne({ _id: option.jobId }).populate({
                path: 'jobInfluences', populate: {
                    path: 'job'
                }
            });
            for (const jobInfluence of dbOption.jobInfluences) {
                if (jobInfluence.job.abbreviation != pickedJob) {
                    toBeDeleted.push(option['jobId'])
                }
            }
        }
        sixthQuestion['options'] = sixthQuestion['options'].filter((option: any) => !toBeDeleted.includes(option['jobId']))
        sixthQuestion['question'] = sixthQuestion['question'] + " " + sixthQuestion['options'][0]['text'];
        return sixthQuestion;
    }

    getSeventQuestion = async (req: express.Request, current: any) => {
        let seventhQuestion = await QuestionModel.findOne({ question: "Wie spannend findest du folgende Aufgaben?" })
            .populate("answerOptions")
            .then((response) => this.transformQuestion(response))
        let pickedJob = current['highestJobs'][1]
        const toBeDeleted: any[] = [];
        for (const option of seventhQuestion.options) {
            const dbOption = await AnswerOptionModel.findOne({ _id: option.jobId }).populate({
                path: 'jobInfluences', populate: {
                    path: 'job'
                }
            });
            for (const jobInfluence of dbOption.jobInfluences) {
                if (jobInfluence.job.abbreviation != pickedJob) {
                    toBeDeleted.push(option['jobId'])
                }
            }
        }
        seventhQuestion['options'] = seventhQuestion['options'].filter((option: any) => !toBeDeleted.includes(option['jobId']))
        seventhQuestion['question'] = seventhQuestion['question'] + " " + seventhQuestion['options'][0]['text'];
        return seventhQuestion;
    }

    getEightQuestion = async (req: express.Request, current: any) => {
        let eightQuestion = await QuestionModel.findOne({ question: "Wie spannend findest du folgende Aufgaben?" })
            .populate("answerOptions")
            .then((response) => this.transformQuestion(response))
        let pickedJob = current['highestJobs'][2]
        const toBeDeleted: any[] = [];
        for (const option of eightQuestion.options) {
            const dbOption = await AnswerOptionModel.findOne({ _id: option.jobId }).populate({
                path: 'jobInfluences', populate: {
                    path: 'job'
                }
            });
            for (const jobInfluence of dbOption.jobInfluences) {
                if (jobInfluence.job.abbreviation != pickedJob) {
                    toBeDeleted.push(option['jobId'])
                }
            }
        }
        eightQuestion['options'] = eightQuestion['options'].filter((option: any) => !toBeDeleted.includes(option['jobId']))
        eightQuestion['question'] = eightQuestion['question'] + " " + eightQuestion['options'][0]['text'];
        return eightQuestion;
    }

    getNinethQuestion = async (req: express.Request, current: any) => {
        const dbQuestions = await QuestionModel.find({}).populate({
            path: 'answerOptions',
            populate: {
                path: 'jobInfluences',
                populate: { path: 'job' }
            }
        });
        const allPersonality = dbQuestions.filter((question) => question.questionMeasure === 'Personality');
        const allCompetences = dbQuestions.filter((question) => question.questionMeasure === 'Competences');
        let subsetPersonality = [];
        let subsetCompetences = [];
        let visitedPersonality = new Set();
        let visitedCompetences = new Set();

        for (const question of allPersonality) {
            for (const answerOption of question.answerOptions) {
                for (const jobInfluence of answerOption.jobInfluences) {
                    if (current['highestJobs'].includes(jobInfluence.job.abbreviation)
                        && !visitedPersonality.has(question._id)) {
                        visitedPersonality.add(question._id);
                        subsetPersonality.push(question)
                    }
                }
            }
        }

        for (const question of allCompetences) {
            for (const answerOption of question.answerOptions) {
                for (const jobInfluence of answerOption.jobInfluences) {
                    if (current['highestJobs'].includes(jobInfluence.job.abbreviation)
                        && !visitedCompetences.has(question._id)) {
                        visitedCompetences.add(question._id);
                        subsetCompetences.push(question)
                    }
                }
            }
        }

        current['personality'] = subsetPersonality;
        current['competences'] = subsetCompetences;
        const randomNumber = Math.round(Math.random() * (current['personality'].length - 1));
        const personalityQuestion = current['personality'].splice(randomNumber, 1)[0];
        return this.transformQuestion(personalityQuestion);
    }

    transformQuestion = (response: any) => {
        let map: any = {
            "Multiple Choice": "MC",
            "Rank Order": "RO",
            "Multiple Options": "MO",
            "Likert Scale": "LS",
            "Forced Choice": "FC"
        }
        return ({
            id: response._id, answerType: map[response?.questionType!],
            question: response.question,
            options:
                response.answerOptions.map((option: any) => ({ jobId: option._id, labels: JSON.stringify(option.labels), text: option.text }))
        })

    }

    getUserFinalJobScores(current: any) {
        let finalJobScores = { ...current['currentJobScores'] };
        let toBeDeleted = []
        for (const key in finalJobScores) {
            if (!current['highestJobs'].includes(key)) {
                toBeDeleted.push(key)
            }

        }


        for (const key of toBeDeleted) {
            delete finalJobScores[key]
        }

        this.cleanJobResults(finalJobScores)
        return finalJobScores
    }

    clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

    cleanJobResults(jobResults: any) {
        for (const key in jobResults) {
            if (key != 'sessionFinished') {
                jobResults[key]['score'] = this.clamp(jobResults[key]['score'], 0, jobResults[key]['max_score'])
            }
            for (const secondKey in jobResults[key]) {
                if (secondKey != "max_score" && secondKey != "score" && secondKey != 'skills' && secondKey != "id") {
                    jobResults[key][secondKey]['score'] = this.clamp(jobResults[key][secondKey]['score'], 0,
                        jobResults[key][secondKey]['max_score']
                    )
                }
            }
        }
    }


    transFormOption = (option: any) =>
    ({
        jobId: option._id, labels: option.labels, text: option.text
    })

}

export default new InferenceEngine();