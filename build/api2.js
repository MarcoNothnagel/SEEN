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
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const readline = __importStar(require("readline"));
const exp = (0, express_1.default)();
const port = 3000;
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const serverPromise = new Promise((resolve, reject) => {
    exp.listen(port, () => {
        console.log(`Connected successfully on port ${port}`);
        resolve();
    });
});
let transactions = [];
function fetchData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get('https://cdn.seen.com/challenge/transactions-v2.json');
            transactions = response.data.map((item) => ({
                transactionId: item.transactionId,
                authorizationCode: item.authorizationCode,
                transactionDate: item.transactionDate,
                customerId: item.customerId,
                transactionType: item.transactionType,
                transactionStatus: item.transactionStatus,
                description: item.description,
                amount: Number(item.amount).toFixed(2),
                metadata: item.metadata
            }));
        }
        catch (error) {
            console.error('Error fetching data:', error);
        }
    });
}
// filter by console input
function startFilter() {
    return __awaiter(this, void 0, void 0, function* () {
        let filteredTransactions = [];
        serverPromise.then(() => {
            rl.question('Enter the customer ID: ', (customerId) => {
                if (customerId != "0") {
                    console.log(`Customer ID entered: ${customerId}`);
                    filteredTransactions = transactions.filter(transaction => transaction.customerId === parseInt(customerId));
                    console.log(filteredTransactions);
                }
                else {
                    rl.close();
                    process.exit();
                }
            });
        });
    });
}
function sendOutput() {
    exp.get('/', (req, res) => {
        if (transactions) {
            res.json(transactions);
        }
        else {
            res.status(500).json({ error: 'Data not fetched yet' });
        }
    });
    console.log("output sent, check Postman. GET at http://localhost:3000");
    // rl.close();
    // startFilter();
}
fetchData();
startFilter();
sendOutput();
