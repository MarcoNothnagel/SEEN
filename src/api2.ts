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
    rl.question('Enter the customer ID: ', async (customerId: string) => {
        if (customerId != "0"){
            console.log(`Customer ID entered: ${customerId}`);
            if (transactions && transactions.length > 0) {
                filteredTransactions = transactions.filter((transaction: { customerId: number }) => transaction.customerId === parseInt(customerId));

                let deviceArray: string[] = await getDevices(filteredTransactions);
                let deviceLinkCustomers: number[] = await findDeviceLink(transactions, deviceArray, parseInt(customerId));

                let p2PArray: Interfaces.P2PData[] = await getP2PTransactions(filteredTransactions);
                let transactionLinkCustomers: Interfaces.RelatedCustomer[] = await findP2PLink(transactions, p2PArray);

                let finalOutput: Interfaces.RootRelated = await buildRelatedCustomers(deviceLinkCustomers, transactionLinkCustomers);
                sendOutput(finalOutput);

            } else {
                console.error('No transactions data available');
            }
        } else {
            process.exit();
        }
        rl.close();

    });
}   

async function getP2PTransactions(filteredTransactions: Interfaces.Transaction[]) {
    let p2PArray: Interfaces.P2PData[] = [];
    if (filteredTransactions.length > 0) {
        filteredTransactions.forEach((transaction) => {
            if (transaction.transactionType === 'P2P_SEND' || transaction.transactionType === 'P2P_RECEIVE') {
                let newP2P: Interfaces.P2PData = {
                    transactionType: transaction.transactionType,
                    transactionDate: transaction.transactionDate,
                    transactionAmount: transaction.amount
                }
                p2PArray.push(newP2P);
            }
        });

    } else {
        console.error('No transactions found');
    }

    return p2PArray;
}


async function findP2PLink(allTransactions: Interfaces.Transaction[], p2PArray: Interfaces.P2PData[]) {
    let p2PLinkCustomers: Interfaces.RelatedCustomer[] = [];
    if (allTransactions && allTransactions.length > 0) {
        let p2pLookFor: string;
        allTransactions.forEach((transaction) => {
            p2PArray.forEach((p2p) => {
                // not using ! in case data does not properly align (alternatively we can use regex)
                if (p2p.transactionType === 'P2P_SEND') {
                    p2pLookFor = 'P2P_RECEIVE';
                } else if (p2p.transactionType === 'P2P_RECEIVE'){
                    p2pLookFor = 'P2P_SEND';
                }

                if (transaction.transactionType === p2pLookFor && transaction.transactionDate === p2p.transactionDate && Math.abs(transaction.amount) === Math.abs(p2p.transactionAmount)) {
                    let newP2PLinkCustomer: Interfaces.RelatedCustomer = {
                        relatedCustomerId: transaction.customerId,
                        relationType: transaction.transactionType
                    }

                    p2PLinkCustomers.push(newP2PLinkCustomer);
                }
            });
        });
    } else {
        console.error('No transactions data available');
    }

    return(p2PLinkCustomers);

}


async function getDevices(filteredTransactions: Interfaces.Transaction[]) {
    let deviceArray: string[] = [];
    if (filteredTransactions.length > 0) {
        filteredTransactions.forEach((transaction) => {
            if (transaction.metadata.deviceId) { // seperated ifs for readability
                let deviceID: string = transaction.metadata.deviceId;
                if (!deviceArray.includes(deviceID)) {
                    deviceArray.push(deviceID);
                }
            }
        });

    } else {
        console.error('No transactions found');
    }

    return deviceArray;
}


async function findDeviceLink(allTransactions: Interfaces.Transaction[], deviceArray: string[], exludeId: number) {
    let relatedIDs: number[] = [];
    if (allTransactions && allTransactions.length > 0) {
        allTransactions.forEach((transaction) => {
            if (transaction.metadata.deviceId) { // seperated ifs for readability
                let deviceID: string = transaction.metadata.deviceId;
                
                if (deviceArray.includes(deviceID) && !relatedIDs.includes(transaction.customerId) && (exludeId !== transaction.customerId)) {
                    relatedIDs.push(transaction.customerId);
                }
            }
        });

    } else {
        console.error('No transactions data available');
    }

    return relatedIDs;
}


async function buildRelatedCustomers(deviceLinkCustomers: number[], transactionLinkCustomers: Interfaces.RelatedCustomer[]) {
    let relatedCustomers: Interfaces.RootRelated;
    let rootTransactions: Interfaces.RelatedCustomer[] = [];
    transactionLinkCustomers.forEach((transaction) => {
        rootTransactions.push(transaction);
    });
    deviceLinkCustomers.forEach((customerLink) => {
        let deviceLink: Interfaces.RelatedCustomer = {
            relatedCustomerId: customerLink,
            relationType: 'DEVICE'
        }
        rootTransactions.push(deviceLink);
    });

    relatedCustomers = {relatedTransactions : rootTransactions};
    
    return relatedCustomers;
}




function sendOutput(rootObj: Interfaces.RootRelated): void {
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

