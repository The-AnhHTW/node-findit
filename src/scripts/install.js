"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Question_json_1 = require("./Question/Question.json");
var AnswerOption_json_1 = require("./AnswerOption/AnswerOption.json");
var JobInfluence_json_1 = require("./JobInfluence/JobInfluence.json");
var Skill_json_1 = require("./Skill/Skill.json");
var SkillInfluence_json_1 = require("./SkillInfluence/SkillInfluence.json");
var Job_json_1 = require("./Job/Job.json");
var QuestionModel_1 = require("@models/Question/QuestionModel");
var AnswerOptionModel_1 = require("@models/AnswerOption/AnswerOptionModel");
var JobInfluenceModel_1 = require("@models/JobInfluence/JobInfluenceModel");
var SkillModel_1 = require("@models/Skill/SkillModel");
var SkillInfluenceModel_1 = require("@models/SkillInfluence/SkillInfluenceModel");
var JobModel_1 = require("@models/Job/JobModel");
var mongoose_1 = require("mongoose");
var dbJobs = Job_json_1["default"].map(function (oldJob) {
    var jFields = oldJob.fields;
    return new JobModel_1["default"]({ "abbreviation": oldJob.pk, "title": jFields.title });
});
// map old Questions to new
var dbSkills = Skill_json_1["default"].map(function (oldSkill) {
    var _a;
    var sFields = oldSkill.fields;
    return new SkillModel_1["default"]({
        "description": "", "job": (_a = dbJobs.find(function (job) { return job.abbreviation === sFields.job; })) === null || _a === void 0 ? void 0 : _a._id,
        "skill": sFields.skill
    });
});
var newQuestions = Question_json_1["default"].map(function (oldQuestion) {
    var fields = oldQuestion.fields;
    return {
        question: fields.question,
        'questionMeasure': QuestionModel_1.QuestionMeasure[fields.questionMeasure],
        'questionType': QuestionModel_1.QuestionType[fields.answerType],
        'stageQuestion': oldQuestion.pk % 100 === 0 ? true : false,
        'answerOptions': AnswerOption_json_1["default"]
            .filter(function (oldAnswerOption) { return oldAnswerOption.fields.question === oldQuestion.pk; })
            .map(function (oldAnswerOption) {
            var aOfields = oldAnswerOption.fields;
            return {
                'labels': aOfields.labels,
                'text': aOfields.text,
                'jobInfluences': JobInfluence_json_1["default"].
                    filter(function (oldJobInfluence) { return oldJobInfluence.fields.answer_option === oldAnswerOption.pk; }).
                    map(function (oldJobInfluences) {
                    var jIfields = oldJobInfluences.fields;
                    var job = dbJobs.find(function (job) { return job.abbreviation === jIfields.job; });
                    return {
                        "job": ({ 'abbreviation': job === null || job === void 0 ? void 0 : job.abbreviation, 'title': job === null || job === void 0 ? void 0 : job.title }),
                        "pickedScore": jIfields.picked_factor,
                        "notPickedScore": jIfields.not_picked_factor,
                        "skillInfluences": SkillInfluence_json_1["default"].filter(function (oldSkillInfluence) {
                            return oldSkillInfluence.fields.job_answer === oldJobInfluences.pk;
                        }).map(function (oldSkillInfluence) {
                            return {
                                "notPickedScore": oldSkillInfluence.fields.not_picked_factor,
                                "pickedScore": oldSkillInfluence.fields.picked_factor,
                                "skill": dbSkills.find(function (skill) { return skill.skill === oldSkillInfluence.fields.skill; })
                            };
                        })
                    };
                })
            };
        })
    };
});
var mongo_uri = 'mongodb://admin:12345@localhost:27017';
mongoose_1["default"].connect(mongo_uri, {
    dbName: "findit"
}).then(function () {
    Promise.all([
        //Deleeting all previous models
        SkillModel_1["default"].remove({}),
        JobModel_1["default"].remove({}),
        QuestionModel_1["default"].remove({}),
        SkillModel_1["default"].remove({}),
        SkillInfluenceModel_1["default"].remove({}),
        JobInfluenceModel_1["default"].remove({})
    ]).then(function () { return __awaiter(void 0, void 0, void 0, function () {
        var promises, _i, newQuestions_1, question, dbQuesiton, _a, _b, answerOption, dbAnswerOption, _loop_1, _c, _d, jobInfluence;
        var _e, _f;
        return __generator(this, function (_g) {
            promises = [];
            for (_i = 0, newQuestions_1 = newQuestions; _i < newQuestions_1.length; _i++) {
                question = newQuestions_1[_i];
                dbQuesiton = new QuestionModel_1["default"](__assign(__assign({}, question), { 'answerOptions': [] }));
                for (_a = 0, _b = question.answerOptions; _a < _b.length; _a++) {
                    answerOption = _b[_a];
                    dbAnswerOption = new AnswerOptionModel_1["default"](__assign(__assign({}, answerOption), { 'jobInfluences': [] }));
                    _loop_1 = function (jobInfluence) {
                        var dbJobInfluence = new JobInfluenceModel_1["default"](__assign(__assign({}, jobInfluence), { job: (_e = dbJobs.find(function (job) { return job.abbreviation === jobInfluence.job.abbreviation; })) === null || _e === void 0 ? void 0 : _e._id, 'skillInfluences': [] }));
                        var _loop_2 = function (skillInfluence) {
                            var dbSkillInfluence = new SkillInfluenceModel_1["default"](__assign(__assign({}, skillInfluence), { skill: (_f = dbSkills.find(function (skill) { return skill.skill === skillInfluence.skill.skill; })) === null || _f === void 0 ? void 0 : _f._id }));
                            promises.push(dbSkillInfluence.save());
                            dbJobInfluence.skillInfluences.push(dbSkillInfluence._id);
                        };
                        for (var _h = 0, _j = jobInfluence.skillInfluences; _h < _j.length; _h++) {
                            var skillInfluence = _j[_h];
                            _loop_2(skillInfluence);
                        }
                        promises.push(dbJobInfluence.save());
                        dbAnswerOption.jobInfluences.push(dbJobInfluence._id);
                    };
                    for (_c = 0, _d = answerOption.jobInfluences; _c < _d.length; _c++) {
                        jobInfluence = _d[_c];
                        _loop_1(jobInfluence);
                    }
                    promises.push(dbAnswerOption.save());
                    dbQuesiton.answerOptions.push(dbAnswerOption._id);
                }
                promises.push(dbQuesiton.save());
            }
            // const hashedPW = await hashPassword("12345");
            // const adminUser = new UserModel({
            //     email: "admin@admin.de",
            //     'isActive': true,
            //     'role': 'admin',
            //     'password': hashedPW,
            //     'name': 'admin',
            //     "lastName": "adminF"
            // } as User);
            return [2 /*return*/, Promise.all([
                    JobModel_1["default"].insertMany(dbJobs),
                    SkillModel_1["default"].insertMany(dbSkills),
                    promises,
                    // adminUser.save()
                ])];
        });
    }); }).then(function () {
        console.log("worked like a charm!");
    })["catch"](function (err) {
        console.log({ err: err });
        console.log("failed miserably!");
    });
});
