import express, {Application, Request, Response} from 'express';
import axios from 'axios';
import * as readline from 'readline';
import * as transactionInterfaces from './interfaces/transactionInterfaces';
import * as api1Interfaces from './interfaces/api1Interfaces';
import { sendOutput } from './sendOutput';
import { fetchData } from './fetchData';


export class Main {
    private exp: Application;
    private port: number;

    constructor(port: number) {
        this.exp = express();
        this.port = port;
    }

    async start() {
        this.exp.listen(this.port, ()=> {
            console.log(`Connected successfully on port ${this.port}`);
        });
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        let transactions = await fetchData();
        let filteredTransactions: transactionInterfaces.Transaction[] = [];
        rl.question('Enter the customer ID: ', async (customerId: string) => {
            if (customerId != "0"){
                console.log(`Customer ID entered: ${customerId}`);
                if (transactions && transactions.length > 0) {
                    filteredTransactions = transactions.filter((transaction: { customerId: number }) => transaction.customerId === parseInt(customerId));
                    
                    let rootObj: api1Interfaces.RootObject;
                    let rootTransactions: api1Interfaces.TransactionFin[];
                    let nonRootTransactions: transactionInterfaces.Transaction[];

                    [rootObj, rootTransactions, nonRootTransactions] = await this.buildRootTransactions(filteredTransactions);
                    let finalOutput: api1Interfaces.RootObject = await this.buildRoot(rootObj, nonRootTransactions, rootTransactions);

                    sendOutput(finalOutput, this.exp);

                } else {
                    console.error('No transactions data available');
                }
            } else {
                process.exit();
            }
            rl.close();

        });
    }   

    private async buildRootTransactions(filteredTransactions: transactionInterfaces.Transaction[]): Promise<[api1Interfaces.RootObject, api1Interfaces.TransactionFin[], transactionInterfaces.Transaction[]]> {
        let rootObj: api1Interfaces.RootObject = { transactions: [] };
        let rootTransactions: api1Interfaces.TransactionFin[] = [];
        let nonRootTransactions: transactionInterfaces.Transaction[] = [];

        if (filteredTransactions.length > 0) {
            filteredTransactions.forEach((transaction) => {
                if (transaction.metadata.relatedTransactionId === undefined || transaction.metadata.relatedTransactionId === null) {
                    let newTransaction: api1Interfaces.TransactionFin = {
                        createdAt: transaction.transactionDate,
                        updatedAt: transaction.transactionDate,
                        transactionId: transaction.transactionId,
                        authorizationCode: transaction.authorizationCode,
                        status: transaction.transactionStatus,
                        description: transaction.description,
                        transactionType: transaction.transactionType,
                        metadata: {deviceId: transaction.metadata.deviceId},
                        timeline: [{
                            createdAt: transaction.transactionDate,
                            status: transaction.transactionStatus,
                            amount: transaction.amount
                        }]
                    }
                    rootTransactions.push(newTransaction);
                } else {
                    nonRootTransactions.push(transaction);
                }
            });

            rootObj = {transactions: rootTransactions};

        } else {
            console.error('No transactions found');
        }

        return [rootObj, rootTransactions, nonRootTransactions];
    }   


    private async buildRoot(rootObj: api1Interfaces.RootObject, nonRootTransactions: transactionInterfaces.Transaction[], rootTransactions: api1Interfaces.TransactionFin[]) {
        let similarTransactions: transactionInterfaces.Transaction[];

        if (rootObj && rootObj.transactions && rootObj.transactions.length > 0 && nonRootTransactions.length > 0) {
            rootObj.transactions.forEach(async (rootTransaction) => {
                similarTransactions = [];
                nonRootTransactions.forEach((nonRootTransaction) => {
                    if (rootTransaction.authorizationCode === nonRootTransaction.authorizationCode) {
                        similarTransactions.push(nonRootTransaction);
                    }
                });

                if (similarTransactions.length > 0) {
                    await this.buildTimeLine(similarTransactions, rootTransaction);
                }
            });
        } else {
            if (rootTransactions.length === 0) {
                console.error('No root transactions found');
            };
            if (nonRootTransactions.length === 0) {
                console.error('No non-root transactions found');
            };
        }

        return(rootObj);

    }

    private async buildTimeLine(similarTransactions: transactionInterfaces.Transaction[], rootTransaction: api1Interfaces.TransactionFin) {
        if (similarTransactions.length > 0) {
            let latestReference: number | undefined = rootTransaction.transactionId;
            similarTransactions.forEach((transaction) => {
                if (transaction.metadata.relatedTransactionId === latestReference) {
                    let newTimeLine: api1Interfaces.Timeline = {
                        createdAt: transaction.transactionDate,
                        status: transaction.transactionStatus,
                        amount: transaction.amount
                    };
                    rootTransaction.timeline?.push(newTimeLine);
                    rootTransaction.updatedAt = transaction.transactionDate;
                    rootTransaction.status = transaction.transactionStatus;

                    latestReference = transaction.transactionId;
                }
            });
        }

    }

}
