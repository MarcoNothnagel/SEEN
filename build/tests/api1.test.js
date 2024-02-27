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
Object.defineProperty(exports, "__esModule", { value: true });
const api1_1 = require("../api1");
const main = new api1_1.Main(3000);
describe('Main', () => {
    // tests for start()
    // TODO. struggling with getting the mock functions to work
    // tests for buildRootTransactions()
    test('buildRootTransactions when filteredTransactions is empty', () => __awaiter(void 0, void 0, void 0, function* () {
        const filteredTransactions = [];
        const [rootObj, rootTransactions, nonRootTransactions] = yield main.buildRootTransactions(filteredTransactions);
        expect(rootObj.transactions).toEqual([]);
        expect(rootTransactions).toEqual([]);
        expect(nonRootTransactions).toEqual([]);
    }));
    test('buildRootTransactions when filteredTransactions contains transactions with and without relatedTransactionId', () => __awaiter(void 0, void 0, void 0, function* () {
        const filteredTransactions = [
            {
                transactionId: 1,
                authorizationCode: '',
                transactionDate: '',
                customerId: 123,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: {}
            },
            {
                transactionId: 2,
                authorizationCode: '',
                transactionDate: '',
                customerId: 123,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: { relatedTransactionId: 1 }
            }
        ];
        const [rootObj, rootTransactions, nonRootTransactions] = yield main.buildRootTransactions(filteredTransactions);
        expect(rootObj.transactions.length).toBe(1);
        expect(rootObj.transactions[0].transactionId).toBe(1);
        expect(rootTransactions.length).toBe(1);
        expect(nonRootTransactions.length).toBe(1);
    }));
    const mockBuildTimeLine = jest.fn().mockResolvedValue(undefined);
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });
    // tests for buildRoot()
    test('buildRoot when no rootObj is provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const nonRootTransactions = [];
        const rootTransactions = [];
        const rootObj = { transactions: [] };
        yield expect(main.buildRoot(rootObj, nonRootTransactions, rootTransactions)).resolves.toEqual(rootObj);
    }));
    test('buildRoot when empty root transactions and non-root transactions', () => __awaiter(void 0, void 0, void 0, function* () {
        const rootObj = { transactions: [] };
        const nonRootTransactions = [];
        const rootTransactions = [];
        yield expect(main.buildRoot(rootObj, nonRootTransactions, rootTransactions)).resolves.toEqual(rootObj);
    }));
    test('buildRoot with non-matching transactions', () => __awaiter(void 0, void 0, void 0, function* () {
        const rootObj = {
            transactions: [
                { authorizationCode: 'abc123' },
                { authorizationCode: 'def456' },
            ],
        };
        const nonRootTransactions = [
            {
                transactionId: 1,
                authorizationCode: '11111111111111',
                transactionDate: '',
                customerId: 123,
                transactionType: '',
                transactionStatus: '',
                description: '',
                amount: 1,
                metadata: {}
            },
        ];
        const rootTransactions = [];
        yield expect(main.buildRoot(rootObj, nonRootTransactions, rootTransactions)).resolves.toEqual(rootObj);
        expect(mockBuildTimeLine).not.toHaveBeenCalled();
    }));
    test('buildRoot throws error when no root transactions found', () => __awaiter(void 0, void 0, void 0, function* () {
        const rootObj = { transactions: [] };
        const nonRootTransactions = [];
        const rootTransactions = [];
        yield expect(main.buildRoot(rootObj, nonRootTransactions, rootTransactions)).resolves.toEqual(rootObj); // Expect resolve with rootObj
        expect(rootTransactions).toEqual([]);
        expect(nonRootTransactions).toEqual([]);
    }));
    test('buildRoot throws error when no non-root transactions found', () => __awaiter(void 0, void 0, void 0, function* () {
        const rootObj = { transactions: [{ authorizationCode: 'abc123' }] };
        const nonRootTransactions = [];
        const rootTransactions = [];
        yield expect(main.buildRoot(rootObj, nonRootTransactions, rootTransactions)).resolves.toEqual(rootObj); // Expect resolve with rootObj
        expect(rootTransactions).toEqual([]);
        expect(nonRootTransactions).toEqual([]);
    }));
    // tests for buildTimeLine()
    const mockRootTransaction = {
        createdAt: '',
        updatedAt: '',
        transactionId: 123,
        authorizationCode: '',
        status: '',
        description: '',
        transactionType: '',
        metadata: {},
        timeline: [],
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('buildTimeLine with empty similarTransactions', () => __awaiter(void 0, void 0, void 0, function* () {
        const similarTransactions = [];
        yield expect(main.buildTimeLine(similarTransactions, mockRootTransaction)).resolves.toBeUndefined();
        expect(mockRootTransaction.timeline).toEqual([]);
    }));
    test('buildTimeLine with a single matching transaction', () => __awaiter(void 0, void 0, void 0, function* () {
        const matchingTransaction = {
            transactionId: 1,
            authorizationCode: '',
            transactionDate: '',
            customerId: 123,
            transactionType: '',
            transactionStatus: 'SUCCESS',
            description: '',
            amount: 100,
            metadata: { relatedTransactionId: mockRootTransaction.transactionId }
        };
        const similarTransactions = [matchingTransaction];
        yield expect(main.buildTimeLine(similarTransactions, mockRootTransaction)).resolves.toBeUndefined();
        expect(mockRootTransaction.timeline).toEqual([
            {
                createdAt: matchingTransaction.transactionDate,
                status: matchingTransaction.transactionStatus,
                amount: matchingTransaction.amount,
            }
        ]);
        expect(mockRootTransaction.updatedAt).toEqual(matchingTransaction.transactionDate);
        expect(mockRootTransaction.status).toEqual(matchingTransaction.transactionStatus);
    }));
    // TODO. test fails because no chronological order. update api1 to account
    // test('buildTimeLine with multiple matching transactions', async () => {
    // const matchingTransaction1: transactionInterfaces.Transaction = {
    //     transactionId: 1,
    //     authorizationCode: '',
    //     transactionDate: '',
    //     customerId: 123,
    //     transactionType: '',
    //     transactionStatus: 'SUCCESS',
    //     description: '',
    //     amount: 100,
    //     metadata: { relatedTransactionId: mockRootTransaction.transactionId }
    // };
    // const matchingTransaction2: transactionInterfaces.Transaction = {
    //     transactionId: 2,
    //     authorizationCode: '',
    //     transactionDate: '',
    //     customerId: 456,
    //     transactionType: '',
    //     transactionStatus: 'PENDING',
    //     description: '',
    //     amount: 50,
    //     metadata: { relatedTransactionId: mockRootTransaction.transactionId }
    // };
    // const similarTransactions: transactionInterfaces.Transaction[] = [matchingTransaction1, matchingTransaction2];
    // await expect(main.buildTimeLine(similarTransactions, mockRootTransaction)).resolves.toBeUndefined();
    // // Ensure timeline is updated in chronological order
    // expect(mockRootTransaction.timeline).toEqual([ {
    //         createdAt: matchingTransaction2.transactionDate,
    //         status: matchingTransaction2.transactionStatus,
    //         amount: matchingTransaction2.amount,
    //     },
    //     {
    //     createdAt: matchingTransaction1.transactionDate,
    //     status: matchingTransaction1.transactionStatus,
    //     amount: matchingTransaction1.amount,
    //     }
    // ]);
    // expect(mockRootTransaction.updatedAt).toEqual(matchingTransaction1.transactionDate);
    // expect(mockRootTransaction.status).toEqual(matchingTransaction1.transactionStatus);
    // });
    test('buildTimeLine with no matching transactions', () => __awaiter(void 0, void 0, void 0, function* () {
        const nonMatchingTransaction = {
            transactionId: 1,
            authorizationCode: '',
            transactionDate: '',
            customerId: 123,
            transactionType: '',
            transactionStatus: 'FAILED',
            description: '',
            amount: 200,
            metadata: { relatedTransactionId: 456 }
        };
        const similarTransactions = [nonMatchingTransaction];
        const originalTimeline = mockRootTransaction.timeline;
        yield expect(main.buildTimeLine(similarTransactions, mockRootTransaction)).resolves.toBeUndefined();
        // Ensure timeline is not modified
        expect(mockRootTransaction.timeline).toEqual(originalTimeline);
    }));
});
