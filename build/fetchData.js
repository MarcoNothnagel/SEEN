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
function fetchData() {
    return __awaiter(this, void 0, void 0, function* () {
        let transactions = [];
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
            return (transactions);
        }
        catch (error) {
            console.error('Error fetching data:', error);
        }
    });
}
exports.fetchData = fetchData;
