import Questions from './Question/Question.json';
import AnswerOptions from './AnswerOption/AnswerOption.json';
import JobInfluences from './JobInfluence/JobInfluence.json';
import Skills from './Skill/Skill.json';
import SkillInfluences from './SkillInfluence/SkillInfluence.json';
import Jobs from './Job/Job.json';
import QuestionModel, { Question, QuestionMeasure, QuestionType } from '@models/Question/QuestionModel';
import AnswerOptionModel, { AnswerOption, AnswerOptionSchema } from '@models/AnswerOption/AnswerOptionModel';
import JobInfluenceModel, { JobInfluence } from '@models/JobInfluence/JobInfluenceModel';
import SkillModel, { Skill } from '@models/Skill/SkillModel';
import SkillInfluenceModel, { Skillinfluence } from '@models/SkillInfluence/SkillInfluenceModel';
import JobModel, { Job } from '@models/Job/JobModel';
import mongoose from 'mongoose';
import UserModel, { User } from '@models/User/UserModel';
import { hashPassword } from 'services/hasher';

const dbJobs = Jobs.map((oldJob) => {
    const jFields = oldJob.fields;
    return new JobModel({ "abbreviation": oldJob.pk, "title": jFields.title } as Job)
})

// map old Questions to new
const dbSkills = Skills.map((oldSkill) => {
    const sFields = oldSkill.fields;
    return new SkillModel({
        "description": "", "job": dbJobs.find((job) => job.abbreviation === sFields.job)?._id,
        "skill": sFields.skill
    } as Skill)
})


const newQuestions = Questions.map((oldQuestion) => {
    const { fields } = oldQuestion;
    return ({
        question: fields.question,
        'questionMeasure': QuestionMeasure[fields.questionMeasure as keyof typeof QuestionMeasure],
        'questionType': QuestionType[fields.answerType as keyof typeof QuestionType],
        'stageQuestion': oldQuestion.pk % 100 === 0 ? true : false,
        'answerOptions': AnswerOptions
            .filter((oldAnswerOption) => oldAnswerOption.fields.question === oldQuestion.pk)
            .map((oldAnswerOption) => {
                const aOfields = oldAnswerOption.fields;

                return (
                    {
                        'labels': aOfields.labels,
                        'text': aOfields.text,
                        'jobInfluences': JobInfluences.
                            filter((oldJobInfluence) => oldJobInfluence.fields.answer_option === oldAnswerOption.pk).
                            map((oldJobInfluences) => {
                                const jIfields = oldJobInfluences.fields;
                                const job = dbJobs.find((job) => job.abbreviation === jIfields.job);
                                return ({
                                    "job": ({ 'abbreviation': job?.abbreviation, 'title': job?.title }),
                                    "pickedScore": jIfields.picked_factor,
                                    "notPickedScore": jIfields.not_picked_factor,
                                    "skillInfluences": SkillInfluences.filter((oldSkillInfluence) => {
                                        return oldSkillInfluence.fields.job_answer === oldJobInfluences.pk
                                    }).map((oldSkillInfluence) => {
                                        return ({
                                            "notPickedScore": oldSkillInfluence.fields.not_picked_factor,
                                            "pickedScore": oldSkillInfluence.fields.picked_factor,
                                            "skill": dbSkills.find((skill) => skill.skill === oldSkillInfluence.fields.skill)
                                        } as Skillinfluence)
                                    }),

                                } as JobInfluence)
                            }),
                    } as AnswerOption)

            })
    } as Question)
})
const mongo_uri = 'mongodb://admin:12345@localhost:27017';

mongoose.connect(mongo_uri!, {
    dbName: "findit"
}).then(() => {

    Promise.all(
        [
            //Deleeting all previous models
            SkillModel.remove({}),
            JobModel.remove({}),
            QuestionModel.remove({}),
            SkillModel.remove({}),
            SkillInfluenceModel.remove({}),
            JobInfluenceModel.remove({})
        ]
    ).then(async () => {

        const promises: any[] = [];
        for (const question of newQuestions) {
            const dbQuesiton = new QuestionModel({ ...question, 'answerOptions': [] } as Question)
            for (const answerOption of question.answerOptions) {
                const dbAnswerOption = new AnswerOptionModel({ ...answerOption, 'jobInfluences': [] });
                for (const jobInfluence of answerOption.jobInfluences) {
                    const dbJobInfluence = new JobInfluenceModel({
                        ...jobInfluence, job: dbJobs.find((job) => job.abbreviation === jobInfluence.job.abbreviation)?._id,
                        'skillInfluences': []
                    });
                    for (const skillInfluence of jobInfluence.skillInfluences) {
                        const dbSkillInfluence = new SkillInfluenceModel({
                            ...skillInfluence, skill:
                                dbSkills.find((skill) => skill.skill === skillInfluence.skill.skill)?._id
                        });
                        promises.push(dbSkillInfluence.save());
                        dbJobInfluence.skillInfluences.push(dbSkillInfluence._id);
                    }
                    promises.push(dbJobInfluence.save());
                    dbAnswerOption.jobInfluences.push(dbJobInfluence._id);
                }
                promises.push(dbAnswerOption.save());
                dbQuesiton.answerOptions.push(dbAnswerOption._id);
            }
            promises.push(dbQuesiton.save());
        }
        //     const hashedPW = await hashPassword("12345");
        //    const adminUser = new UserModel({
        //         email: "admin@admin.de",
        //         'isActive': true,
        //         'role': 'admin',
        //         'password': hashedPW,
        //         'name': 'admin',
        //         "lastName": "admin",
        //         questionaires: []
        //     } as User);



        return Promise.all([
            JobModel.insertMany(dbJobs),
            SkillModel.insertMany(dbSkills),
            promises,
            // adminUser.save()
        ])
    }).then(() => {
        console.log("worked like a charm!");
    }).catch((err) => {
        console.log({ err })
        console.log("failed miserably!");
    })

})



