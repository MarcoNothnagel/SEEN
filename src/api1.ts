import express, {Application, Request, Response} from 'express';
import * as transactionInterfaces from './interfaces/transactionInterfaces';
import * as api1Interfaces from './interfaces/api1Interfaces';
import { sendOutput } from './functions/sendOutput';
import { fetchData } from './functions/fetchData';


export class Main {
    private exp: Application;
    private port: number;

    constructor(port: number) {
        this.exp = express();
        this.port = port;
    }

    // start function used to handle IO. it gets input, runs the neccesary functions and gets required output
    async start(customerId: number) {
        // open express lister for port 3000
        this.exp.listen(this.port, ()=> {
            console.log(`Connected successfully on port ${this.port}`);
        });

        // get transactions with fetchData
        let transactions = await fetchData();
        let filteredTransactions: transactionInterfaces.Transaction[] = [];

        // checks if customerId exists, transactions exist, and that its length is more than 0
        if (customerId && transactions && transactions.length > 0) {
            // compact code to collect all the transactions made by a particular user
            filteredTransactions = transactions.filter((transaction: { customerId: number }) => transaction.customerId === customerId);
            
            // create variables for await. seperated for readability
            let rootObj: api1Interfaces.RootObject;
            let rootTransactions: api1Interfaces.TransactionFin[];
            let nonRootTransactions: transactionInterfaces.Transaction[];

            // populate the variables with buildRootTransactions function
            [rootObj, rootTransactions, nonRootTransactions] = await this.buildRootTransactions(filteredTransactions);

            // make final output the result of buildRoot function
            let finalOutput: api1Interfaces.RootObject = await this.buildRoot(rootObj, nonRootTransactions, rootTransactions);

            // send the final rootObject to be send to localhost 3000
            sendOutput(finalOutput, this.exp);

        } else { // else we simply send an empty root to localhost 3000
            let rootObj: api1Interfaces.RootObject= {transactions: []};
            sendOutput(rootObj, this.exp);
        }
    }   

    // this function seperates the root transactions from the non root transactions
    public async buildRootTransactions(filteredTransactions: transactionInterfaces.Transaction[]): Promise<[api1Interfaces.RootObject, api1Interfaces.TransactionFin[], transactionInterfaces.Transaction[]]> {
        // create empty variables from interfaces
        let rootObj: api1Interfaces.RootObject = { transactions: [] };
        let rootTransactions: api1Interfaces.TransactionFin[] = [];
        let nonRootTransactions: transactionInterfaces.Transaction[] = [];
    
        // checks if filteredTransactions exists and if it is populated
        if (filteredTransactions && filteredTransactions.length > 0) {
            // loop through the filteredTransactions
            filteredTransactions.forEach((transaction) => {
                // checks if there are essentially no relatedTransactionId
                if (transaction.metadata.relatedTransactionId === undefined || transaction.metadata.relatedTransactionId === null) {
                    // build a transaction interface that has the format of the final output
                    let newTransaction: api1Interfaces.TransactionFin = {
                        createdAt: transaction.transactionDate,
                        updatedAt: transaction.transactionDate,
                        transactionId: transaction.transactionId,
                        authorizationCode: transaction.authorizationCode,
                        status: transaction.transactionStatus,
                        description: transaction.description,
                        transactionType: transaction.transactionType,
                        metadata: {deviceId: transaction.metadata.deviceId},
                        // populate timeline with itself
                        timeline: [{
                            createdAt: transaction.transactionDate,
                            status: transaction.transactionStatus,
                            amount: transaction.amount
                        }]
                    }
                    // push the new Transaction to the rootTransaction list
                    rootTransactions.push(newTransaction);
                } else {
                    // if it is related to another transaction we add it to the nonRootTransaction list
                    nonRootTransactions.push(transaction);
                }
            });

            // establish the base of the rootObject
            rootObj = {transactions: rootTransactions};
        } else { // else we just make sure that the variables are empty for the return
            rootObj = { transactions: [] };
            rootTransactions = [];
            nonRootTransactions = [];
        }
    
        // return an array with multiple values.
        return [rootObj, rootTransactions, nonRootTransactions];
    }


    // this function is used to build the final rootobject that will later be output
    public async buildRoot(rootObj: api1Interfaces.RootObject, nonRootTransactions: transactionInterfaces.Transaction[], rootTransactions: api1Interfaces.TransactionFin[]) {
        // create list for similarTransactions
        let similarTransactions: transactionInterfaces.Transaction[];

        // if rootObj exists and if it has transactions and if it is populated and if the rootTransaction list is also populated
        if (rootObj && rootObj.transactions && rootObj.transactions.length > 0 && nonRootTransactions.length > 0) {
            // iterate through all of roots transactions
            rootObj.transactions.forEach(async (rootTransaction) => {
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
                    await this.buildTimeLine(similarTransactions, rootTransaction);
                }
            });
        }
        // return the root object
        return(rootObj);
    }


    // function is used to build and populate the timeline for the final transaction interface
    public async buildTimeLine(similarTransactions: transactionInterfaces.Transaction[], rootTransaction: api1Interfaces.TransactionFin) {
        // there similarTransactions is populated
        if (similarTransactions.length > 0) {
            // latest reference used to track progress and link to latest transaction
            let latestReference: number | undefined = rootTransaction.transactionId;
            // iterate through similarTransactions
            similarTransactions.forEach((transaction) => {
                // if we find a match to the latest reference
                if (transaction.metadata.relatedTransactionId === latestReference) {
                    // create a timeline
                    let newTimeLine: api1Interfaces.Timeline = {
                        createdAt: transaction.transactionDate,
                        status: transaction.transactionStatus,
                        amount: transaction.amount
                    };
                    // we push the timeline and update the parent interface
                    rootTransaction.timeline?.push(newTimeLine);
                    rootTransaction.updatedAt = transaction.transactionDate;
                    rootTransaction.status = transaction.transactionStatus;

                    // new latest reference
                    latestReference = transaction.transactionId;
                }
            });
        } else { // essentially do nothing
            return;
        }
    }

}
