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
                if (transactions && transactions.length > 0) {
                    filteredTransactions = transactions.filter((transaction) => transaction.customerId === customerId);
                    let deviceArray = yield this.getDevices(filteredTransactions);
                    let deviceLinkCustomers = yield this.findDeviceLink(transactions, deviceArray, customerId);
                    let p2PArray = yield this.getP2PTransactions(filteredTransactions);
                    let transactionLinkCustomers = yield this.findP2PLink(transactions, p2PArray);
                    let finalOutput = yield this.buildRelatedCustomers(deviceLinkCustomers, transactionLinkCustomers);
                    (0, sendOutput_1.sendOutput)(finalOutput, this.exp);
                }
                else {
                    console.error('No transactions data available');
                }
            }
            else {
                process.exit();
            }
        });
    }
    getP2PTransactions(filteredTransactions) {
        return __awaiter(this, void 0, void 0, function* () {
            let p2PArray = [];
            if (filteredTransactions.length > 0) {
                filteredTransactions.forEach((transaction) => {
                    if (transaction.transactionType === 'P2P_SEND' || transaction.transactionType === 'P2P_RECEIVE') {
                        let newP2P = {
                            transactionType: transaction.transactionType,
                            transactionDate: transaction.transactionDate,
                            transactionAmount: transaction.amount
                        };
                        p2PArray.push(newP2P);
                    }
                });
            }
            return p2PArray;
        });
    }
    findP2PLink(allTransactions, p2PArray) {
        return __awaiter(this, void 0, void 0, function* () {
            let p2PLinkCustomers = [];
            if (allTransactions && allTransactions.length > 0) {
                let p2pLookFor;
                allTransactions.forEach((transaction) => {
                    p2PArray.forEach((p2p) => {
                        // not using ! in case data does not properly align (alternatively we can use regex)
                        if (p2p.transactionType === 'P2P_SEND') {
                            p2pLookFor = 'P2P_RECEIVE';
                        }
                        else if (p2p.transactionType === 'P2P_RECEIVE') {
                            p2pLookFor = 'P2P_SEND';
                        }
                        if (transaction.transactionType === p2pLookFor && transaction.transactionDate === p2p.transactionDate && Math.abs(transaction.amount) === Math.abs(p2p.transactionAmount)) {
                            let newP2PLinkCustomer = {
                                relatedCustomerId: transaction.customerId,
                                relationType: transaction.transactionType
                            };
                            p2PLinkCustomers.push(newP2PLinkCustomer);
                        }
                    });
                });
            }
            return p2PLinkCustomers;
        });
    }
    getDevices(filteredTransactions) {
        return __awaiter(this, void 0, void 0, function* () {
            let deviceArray = [];
            if (filteredTransactions.length > 0) {
                filteredTransactions.forEach((transaction) => {
                    if (transaction.metadata.deviceId) { // seperated ifs for readability
                        let deviceID = transaction.metadata.deviceId;
                        if (!deviceArray.includes(deviceID)) {
                            deviceArray.push(deviceID);
                        }
                    }
                });
            }
            return deviceArray;
        });
    }
    findDeviceLink(allTransactions, deviceArray, exludeId) {
        return __awaiter(this, void 0, void 0, function* () {
            let relatedIDs = [];
            if (allTransactions && allTransactions.length > 0) {
                allTransactions.forEach((transaction) => {
                    if (transaction.metadata.deviceId) { // seperated ifs for readability
                        let deviceID = transaction.metadata.deviceId;
                        if (deviceArray.includes(deviceID) && !relatedIDs.includes(transaction.customerId) && (exludeId !== transaction.customerId)) {
                            relatedIDs.push(transaction.customerId);
                        }
                    }
                });
            }
            return relatedIDs;
        });
    }
    buildRelatedCustomers(deviceLinkCustomers, transactionLinkCustomers) {
        return __awaiter(this, void 0, void 0, function* () {
            let relatedCustomers;
            let rootTransactions = [];
            transactionLinkCustomers.forEach((transaction) => {
                rootTransactions.push(transaction);
            });
            deviceLinkCustomers.forEach((customerLink) => {
                let deviceLink = {
                    relatedCustomerId: customerLink,
                    relationType: 'DEVICE'
                };
                rootTransactions.push(deviceLink);
            });
            relatedCustomers = { relatedTransactions: rootTransactions };
            return relatedCustomers;
        });
    }
}
exports.Main = Main;
