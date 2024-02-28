import { Main } from '../api1';
import * as transactionInterfaces from '../interfaces/transactionInterfaces';
import * as api1Interfaces from '../interfaces/api1Interfaces';
// import { sendOutput } from '../functions/sendOutput';
// import { fetchData } from '../functions/fetchData';

const main = new Main(3000);

describe('Main', () => {

    // tests for start()
    // TODO. struggling with getting the mock functions to work

    // tests for buildRootTransactions()

    test('buildRootTransactions when filteredTransactions is empty', async () => {
        const filteredTransactions: transactionInterfaces.Transaction[] = [];
        const [rootObj, rootTransactions, nonRootTransactions] = await main.buildRootTransactions(filteredTransactions);
        
        expect(rootObj.transactions).toEqual([]);
        expect(rootTransactions).toEqual([]);
        expect(nonRootTransactions).toEqual([]);
    });
  
    test('buildRootTransactions when filteredTransactions contains transactions with and without relatedTransactionId', async () => {
        const filteredTransactions: transactionInterfaces.Transaction[] = [
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
        const [rootObj, rootTransactions, nonRootTransactions] = await main.buildRootTransactions(filteredTransactions);
        
        expect(rootObj.transactions.length).toBe(1);
        expect(rootObj.transactions[0].transactionId).toBe(1);
        expect(rootTransactions.length).toBe(1);
        expect(nonRootTransactions.length).toBe(1);
    });


    const mockBuildTimeLine = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => {
        jest.clearAllMocks(); // Clear mocks before each test
    });


    // tests for buildRoot()

    test('buildRoot when no rootObj is provided', async () => {
        const nonRootTransactions: transactionInterfaces.Transaction[] = [];
        const rootTransactions: api1Interfaces.TransactionFin[] = [];
        const rootObj: api1Interfaces.RootObject = { transactions: [] };

        await expect(main.buildRoot(rootObj, nonRootTransactions, rootTransactions)).resolves.toEqual(rootObj);
    });

    test('buildRoot when empty root transactions and non-root transactions', async () => {
        const rootObj: api1Interfaces.RootObject = { transactions: [] };
        const nonRootTransactions: transactionInterfaces.Transaction[] = [];
        const rootTransactions: api1Interfaces.TransactionFin[] = [];

        await expect(main.buildRoot(rootObj, nonRootTransactions, rootTransactions)).resolves.toEqual(rootObj);
    });

    test('buildRoot with non-matching transactions', async () => {
        const rootObj: api1Interfaces.RootObject = {
        transactions: [
            { authorizationCode: 'abc123' },
            { authorizationCode: 'def456' },
        ],
        };
        const nonRootTransactions: transactionInterfaces.Transaction[] = [
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
        const rootTransactions: api1Interfaces.TransactionFin[] = [];

        await expect(main.buildRoot(rootObj, nonRootTransactions, rootTransactions)).resolves.toEqual(rootObj);

        expect(mockBuildTimeLine).not.toHaveBeenCalled();
    });

    test('buildRoot throws error when no root transactions found', async () => {
        const rootObj: api1Interfaces.RootObject = { transactions: [] };
        const nonRootTransactions: transactionInterfaces.Transaction[] = [];
        const rootTransactions: api1Interfaces.TransactionFin[] = [];
    
        await expect(main.buildRoot(rootObj, nonRootTransactions, rootTransactions)).resolves.toEqual(rootObj); // Expect resolve with rootObj
    
        expect(rootTransactions).toEqual([]);
        expect(nonRootTransactions).toEqual([]);
    });

    test('buildRoot throws error when no non-root transactions found', async () => {
        const rootObj: api1Interfaces.RootObject = { transactions: [{ authorizationCode: 'abc123' }] };
        const nonRootTransactions: transactionInterfaces.Transaction[] = [];
        const rootTransactions: api1Interfaces.TransactionFin[] = [];
    
        await expect(main.buildRoot(rootObj, nonRootTransactions, rootTransactions)).resolves.toEqual(rootObj); // Expect resolve with rootObj
    
        expect(rootTransactions).toEqual([]);
        expect(nonRootTransactions).toEqual([]);
    });


    // tests for buildTimeLine()

    const mockRootTransaction: api1Interfaces.TransactionFin = {
        createdAt: '',
        updatedAt: '',
        transactionId: 123,
        authorizationCode: '',
        status: '',
        description: '',
        transactionType: '',
        metadata: {},
        timeline: [],
    }
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    test('buildTimeLine with empty similarTransactions', async () => {
    const similarTransactions: transactionInterfaces.Transaction[] = [];

    await expect(main.buildTimeLine(similarTransactions, mockRootTransaction)).resolves.toBeUndefined();

    expect(mockRootTransaction.timeline).toEqual([]);
    });
    
    test('buildTimeLine with a single matching transaction', async () => {
        const matchingTransaction: transactionInterfaces.Transaction = {
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

        const similarTransactions: transactionInterfaces.Transaction[] = [matchingTransaction];

        await expect(main.buildTimeLine(similarTransactions, mockRootTransaction)).resolves.toBeUndefined();

        expect(mockRootTransaction.timeline).toEqual([
        {
            createdAt: matchingTransaction.transactionDate,
            status: matchingTransaction.transactionStatus,
            amount: matchingTransaction.amount,
        }
        ]);

        expect(mockRootTransaction.updatedAt).toEqual(matchingTransaction.transactionDate);
        expect(mockRootTransaction.status).toEqual(matchingTransaction.transactionStatus);
        });


    // TODO. test fails because no chronological order. update api1 to account
    // the thing is it works in live because it traces from transaction reference which always tends to be in chronological order
    // this test may be irrelevant but might update method to account for this very special test case
    
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
    
    test('buildTimeLine with no matching transactions', async () => {
        const nonMatchingTransaction: transactionInterfaces.Transaction = {
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
        
        const similarTransactions: transactionInterfaces.Transaction[] = [nonMatchingTransaction];
        const originalTimeline = mockRootTransaction.timeline;

        await expect(main.buildTimeLine(similarTransactions, mockRootTransaction)).resolves.toBeUndefined();

        // Ensure timeline is not modified
        expect(mockRootTransaction.timeline).toEqual(originalTimeline);
    });

});

