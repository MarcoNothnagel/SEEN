import express, {Application, Request, Response} from 'express';
import axios from 'axios';
import * as readline from 'readline';
import * as Interfaces from './interfaces';

const exp: Application = express();
const port: number = 3000;


async function fetchData() {
    let transactions: Interfaces.Transaction[] = [];
    try {
        const response = await axios.get('https://cdn.seen.com/challenge/transactions-v2.json');
        transactions = response.data.map((item: any) => ({
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

        return(transactions);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


// filter by console input
async function startFilter() {
    exp.listen(port, ()=> {
        console.log(`Connected successfully on port ${port}`);
    });
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    let transactions = await fetchData();
    let filteredTransactions: Interfaces.Transaction[] = [];
    rl.question('Enter the customer ID: ', (customerId: string) => {
        if (customerId != "0"){
            console.log(`Customer ID entered: ${customerId}`);
            if (transactions && transactions.length > 0) {
                filteredTransactions = transactions.filter((transaction: { customerId: number }) => transaction.customerId === parseInt(customerId));
                buildRootTransactions(filteredTransactions);
            } else {
                console.error('No transactions data available');
            }
        } else {
            process.exit();
        }
        rl.close();

    });
}   


async function buildRootTransactions(filteredTransactions: Interfaces.Transaction[]) {
    let nonRootTransactions: Interfaces.Transaction[] = [];
    let rootTransactions: Interfaces.TransactionFin[] = [];
    let rootObj: Interfaces.RootObject;

    if (filteredTransactions.length > 0) {
        filteredTransactions.forEach((transaction) => {
            if (transaction.metadata.relatedTransactionId === undefined || transaction.metadata.relatedTransactionId === null) {
                let newTransaction: Interfaces.TransactionFin = {
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
        buildRoot(rootObj, nonRootTransactions, rootTransactions);

    } else {
        console.error('No transactions found');
    }
}   


async function buildRoot(rootObj: Interfaces.RootObject, nonRootTransactions: Interfaces.Transaction[], rootTransactions: Interfaces.TransactionFin[]) {
    let similarTransactions: Interfaces.Transaction[];

    if (rootObj && rootObj.transactions && rootObj.transactions.length > 0 && nonRootTransactions.length > 0) {
        rootObj.transactions.forEach((rootTransaction) => {
            similarTransactions = [];
            nonRootTransactions.forEach((nonRootTransaction) => {
                if (rootTransaction.authorizationCode === nonRootTransaction.authorizationCode) {
                    similarTransactions.push(nonRootTransaction);
                }
            });

            if (similarTransactions.length > 0) {
                buildTimeLine(similarTransactions, rootTransaction);
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

    sendOutput(rootObj);

}

async function buildTimeLine(similarTransactions: Interfaces.Transaction[], rootTransaction: Interfaces.TransactionFin) {
    if (similarTransactions.length > 0) {
        let latestReference: number | undefined = rootTransaction.transactionId;
        similarTransactions.forEach((transaction) => {
            if (transaction.metadata.relatedTransactionId === latestReference) {
                let newTimeLine: Interfaces.Timeline = {
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


function sendOutput(rootObj: Interfaces.RootObject): void {
    exp.get('/', (req: Request, res: Response) => {
        if (rootObj) {
            res.json(rootObj);
        } else {
            res.status(500).json({ error: 'Data not fetched yet' });
        }
    });
    console.log("output sent, check Postman. GET at http://localhost:3000");
}


startFilter();

// TODO:
//- clean up