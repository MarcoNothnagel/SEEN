"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const express_1 = __importDefault(require("express"));
const sendOutput_1 = require("./functions/sendOutput");
const fetchData_1 = require("./functions/fetchData");
class Main {
    constructor(port) {
        this.exp = (0, express_1.default)();
        this.port = port;
    }
    start(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.exp.listen(this.port, () => {
                console.log(`Connected successfully on port ${this.port}`);
            });
            let transactions = yield (0, fetchData_1.fetchData)();
            let filteredTransactions = [];
            if (customerId) {
                console.log(`Customer ID entered: ${customerId}`);
                if (transactions && transactions.length > 0) {
                    filteredTransactions = transactions.filter((transaction) => transaction.customerId === customerId);
                    let rootObj;
                    let rootTransactions;
                    let nonRootTransactions;
                    [rootObj, rootTransactions, nonRootTransactions] = yield this.buildRootTransactions(filteredTransactions);
                    let finalOutput = yield this.buildRoot(rootObj, nonRootTransactions, rootTransactions);
                    (0, sendOutput_1.sendOutput)(finalOutput, this.exp);
                }
                else {
                    let rootObj = { transactions: [] };
                    (0, sendOutput_1.sendOutput)(rootObj, this.exp);
                }
            }
            else {
                process.exit();
            }
        });
    }
    buildRootTransactions(filteredTransactions) {
        return __awaiter(this, void 0, void 0, function* () {
            let rootObj = { transactions: [] };
            let rootTransactions = [];
            let nonRootTransactions = [];
            if (filteredTransactions && filteredTransactions.length > 0) {
                filteredTransactions.forEach((transaction) => {
                    if (transaction.metadata.relatedTransactionId === undefined || transaction.metadata.relatedTransactionId === null) {
                        let newTransaction = {
                            createdAt: transaction.transactionDate,
                            updatedAt: transaction.transactionDate,
                            transactionId: transaction.transactionId,
                            authorizationCode: transaction.authorizationCode,
                            status: transaction.transactionStatus,
                            description: transaction.description,
                            transactionType: transaction.transactionType,
                            metadata: { deviceId: transaction.metadata.deviceId },
                            timeline: [{
                                    createdAt: transaction.transactionDate,
                                    status: transaction.transactionStatus,
                                    amount: transaction.amount
                                }]
                        };
                        rootTransactions.push(newTransaction);
                    }
                    else {
                        nonRootTransactions.push(transaction);
                    }
                });
                rootObj = { transactions: rootTransactions };
            }
            else {
                rootObj = { transactions: [] };
                rootTransactions = [];
                nonRootTransactions = [];
            }
            return [rootObj, rootTransactions, nonRootTransactions];
        });
    }
    buildRoot(rootObj, nonRootTransactions, rootTransactions) {
        return __awaiter(this, void 0, void 0, function* () {
            let similarTransactions;
            if (rootObj && rootObj.transactions && rootObj.transactions.length > 0 && nonRootTransactions.length > 0) {
                rootObj.transactions.forEach((rootTransaction) => __awaiter(this, void 0, void 0, function* () {
                    similarTransactions = [];
                    nonRootTransactions.forEach((nonRootTransaction) => {
                        if (rootTransaction.authorizationCode === nonRootTransaction.authorizationCode) {
                            similarTransactions.push(nonRootTransaction);
                        }
                    });
                    if (similarTransactions.length > 0) {
                        yield this.buildTimeLine(similarTransactions, rootTransaction);
                    }
                }));
            }
            else {
                if (rootTransactions.length === 0) {
                    rootTransactions = [];
                }
                ;
                if (nonRootTransactions.length === 0) {
                    nonRootTransactions = [];
                }
                ;
            }
            return (rootObj);
        });
    }
    buildTimeLine(similarTransactions, rootTransaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (similarTransactions.length > 0) {
                let latestReference = rootTransaction.transactionId;
                similarTransactions.forEach((transaction) => {
                    var _a;
                    if (transaction.metadata.relatedTransactionId === latestReference) {
                        let newTimeLine = {
                            createdAt: transaction.transactionDate,
                            status: transaction.transactionStatus,
                            amount: transaction.amount
                        };
                        (_a = rootTransaction.timeline) === null || _a === void 0 ? void 0 : _a.push(newTimeLine);
                        rootTransaction.updatedAt = transaction.transactionDate;
                        rootTransaction.status = transaction.transactionStatus;
                        latestReference = transaction.transactionId;
                    }
                });
            }
            else {
                return;
            }
        });
    }
}
exports.Main = Main;
