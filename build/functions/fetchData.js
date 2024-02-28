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
exports.fetchData = void 0;
const axios_1 = __importDefault(require("axios"));
// simply used to fetch all data
function fetchData() {
    return __awaiter(this, void 0, void 0, function* () {
        let transactions = [];
        try {
            // do an acios get call to read the json file
            const response = yield axios_1.default.get('https://cdn.seen.com/challenge/transactions-v2.json');
            // populate the transactions interface with all transaction values
            transactions = response.data.map((item) => ({
                transactionId: item.transactionId,
                authorizationCode: item.authorizationCode,
                transactionDate: item.transactionDate,
                customerId: item.customerId,
                transactionType: item.transactionType,
                transactionStatus: item.transactionStatus,
                description: item.description,
                amount: Number(item.amount).toFixed(2), // enforce the value being of type number
                metadata: item.metadata
            }));
            return (transactions); // return a list of all transactions
            // try catch with an error for when the data cannot be retreived
        }
        catch (error) {
            console.error('Error fetching data:', error); // might have to revise for touch ups
        }
    });
}
exports.fetchData = fetchData;
