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
    // start function used to handle IO. it gets input, runs the neccesary functions and gets required output
    start(customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            // open express lister for port 3000
            this.exp.listen(this.port, () => {
                console.log(`Connected successfully on port ${this.port}`);
            });
            // get transactions with fetchData
            let transactions = yield (0, fetchData_1.fetchData)();
            let filteredTransactions = [];
            // checks if customerId exists, transactions exist, and that its length is more than 0
            if (customerId && transactions && transactions.length > 0) {
                // compact code to collect all the transactions made by a particular user
                filteredTransactions = transactions.filter((transaction) => transaction.customerId === customerId);
                // create variables for await. seperated for readability
                let rootObj;
                let rootTransactions;
                let nonRootTransactions;
                // populate the variables with buildRootTransactions function
                [rootObj, rootTransactions, nonRootTransactions] = yield this.buildRootTransactions(filteredTransactions);
                // make final output the result of buildRoot function
                let finalOutput = yield this.buildRoot(rootObj, nonRootTransactions, rootTransactions);
                // send the final rootObject to be send to localhost 3000
                (0, sendOutput_1.sendOutput)(finalOutput, this.exp);
            }
            else { // else we simply send an empty root to localhost 3000
                let rootObj = { transactions: [] };
                (0, sendOutput_1.sendOutput)(rootObj, this.exp);
            }
        });
    }
    // this function seperates the root transactions from the non root transactions
    buildRootTransactions(filteredTransactions) {
        return __awaiter(this, void 0, void 0, function* () {
            // create empty variables from interfaces
            let rootObj = { transactions: [] };
            let rootTransactions = [];
            let nonRootTransactions = [];
            // checks if filteredTransactions exists and if it is populated
            if (filteredTransactions && filteredTransactions.length > 0) {
                // loop through the filteredTransactions
                filteredTransactions.forEach((transaction) => {
                    // checks if there are essentially no relatedTransactionId
                    if (transaction.metadata.relatedTransactionId === undefined || transaction.metadata.relatedTransactionId === null) {
                        // build a transaction interface that has the format of the final output
                        let newTransaction = {
                            createdAt: transaction.transactionDate,
                            updatedAt: transaction.transactionDate,
                            transactionId: transaction.transactionId,
                            authorizationCode: transaction.authorizationCode,
                            status: transaction.transactionStatus,
                            description: transaction.description,
                            transactionType: transaction.transactionType,
                            metadata: { deviceId: transaction.metadata.deviceId },
                            // populate timeline with itself
                            timeline: [{
                                    createdAt: transaction.transactionDate,
                                    status: transaction.transactionStatus,
                                    amount: transaction.amount
                                }]
                        };
                        // push the new Transaction to the rootTransaction list
                        rootTransactions.push(newTransaction);
                    }
                    else {
                        // if it is related to another transaction we add it to the nonRootTransaction list
                        nonRootTransactions.push(transaction);
                    }
                });
                // establish the base of the rootObject
                rootObj = { transactions: rootTransactions };
            }
            else { // else we just make sure that the variables are empty for the return
                rootObj = { transactions: [] };
                rootTransactions = [];
                nonRootTransactions = [];
            }
            // return an array with multiple values.
            return [rootObj, rootTransactions, nonRootTransactions];
        });
    }
    // this function sends the 
    buildRoot(rootObj, nonRootTransactions, rootTransactions) {
        return __awaiter(this, void 0, void 0, function* () {
            // create list for similarTransactions
            let similarTransactions;
            // if rootObj exists and if it has transactions and if it is populated and if the rootTransaction list is also populated
            if (rootObj && rootObj.transactions && rootObj.transactions.length > 0 && nonRootTransactions.length > 0) {
                // iterate through all of roots transactions
                rootObj.transactions.forEach((rootTransaction) => __awaiter(this, void 0, void 0, function* () {
                    // make list empty for every value
                    similarTransactions = [];
                    // iterate through nonRootTransactions
                    nonRootTransactions.forEach((nonRootTransaction) => {
                        // if the authorisation code matches we push the transaction to similar transaction array
                        if (rootTransaction.authorizationCode === nonRootTransaction.authorizationCode) {
                            similarTransactions.push(nonRootTransaction);
                        }
                    });
                    // if similarTransactions ended up being populated we call buildTimeLine() to build the timeline object
                    if (similarTransactions.length > 0) {
                        yield this.buildTimeLine(similarTransactions, rootTransaction);
                    }
                }));
            }
            // return the root object
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
