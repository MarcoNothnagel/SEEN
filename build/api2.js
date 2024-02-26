"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Main = void 0;
const express_1 = __importDefault(require("express"));
const readline = __importStar(require("readline"));
const sendOutput_1 = require("./sendOutput");
const fetchData_1 = require("./fetchData");
class Main {
    constructor(port) {
        this.exp = (0, express_1.default)();
        this.port = port;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.exp.listen(this.port, () => {
                console.log(`Connected successfully on port ${this.port}`);
            });
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            let transactions = yield (0, fetchData_1.fetchData)();
            let filteredTransactions = [];
            rl.question('Enter the customer ID: ', (customerId) => __awaiter(this, void 0, void 0, function* () {
                if (customerId != "0") {
                    console.log(`Customer ID entered: ${customerId}`);
                    if (transactions && transactions.length > 0) {
                        filteredTransactions = transactions.filter((transaction) => transaction.customerId === parseInt(customerId));
                        let deviceArray = yield this.getDevices(filteredTransactions);
                        let deviceLinkCustomers = yield this.findDeviceLink(transactions, deviceArray, parseInt(customerId));
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
                rl.close();
            }));
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
            else {
                console.error('No transactions found');
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
            else {
                console.error('No transactions data available');
            }
            return (p2PLinkCustomers);
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
            else {
                console.error('No transactions found');
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
            else {
                console.error('No transactions data available');
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
