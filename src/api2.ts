import express, {Application, Request, Response} from 'express';
import * as readline from 'readline';
import * as transactionInterfaces from './interfaces/transactionInterfaces';
import * as api2Interfaces from './interfaces/api2Interfaces';
import { sendOutput } from './functions/sendOutput';
import { fetchData } from './functions/fetchData';


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

                    let deviceArray: string[] = await this.getDevices(filteredTransactions);
                    let deviceLinkCustomers: number[] = await this.findDeviceLink(transactions, deviceArray, parseInt(customerId));

                    let p2PArray: api2Interfaces.P2PData[] = await this.getP2PTransactions(filteredTransactions);
                    let transactionLinkCustomers: api2Interfaces.RelatedCustomer[] = await this.findP2PLink(transactions, p2PArray);

                    let finalOutput: api2Interfaces.RootObject = await this.buildRelatedCustomers(deviceLinkCustomers, transactionLinkCustomers);
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


    private async getP2PTransactions(filteredTransactions: transactionInterfaces.Transaction[]) {
        let p2PArray: api2Interfaces.P2PData[] = [];
        if (filteredTransactions.length > 0) {
            filteredTransactions.forEach((transaction) => {
                if (transaction.transactionType === 'P2P_SEND' || transaction.transactionType === 'P2P_RECEIVE') {
                    let newP2P: api2Interfaces.P2PData = {
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


    private async findP2PLink(allTransactions: transactionInterfaces.Transaction[], p2PArray: api2Interfaces.P2PData[]) {
        let p2PLinkCustomers: api2Interfaces.RelatedCustomer[] = [];
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
                        let newP2PLinkCustomer: api2Interfaces.RelatedCustomer = {
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


    private async getDevices(filteredTransactions: transactionInterfaces.Transaction[]) {
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


    private async findDeviceLink(allTransactions: transactionInterfaces.Transaction[], deviceArray: string[], exludeId: number) {
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


    private async buildRelatedCustomers(deviceLinkCustomers: number[], transactionLinkCustomers: api2Interfaces.RelatedCustomer[]) {
        let relatedCustomers: api2Interfaces.RootObject;
        let rootTransactions: api2Interfaces.RelatedCustomer[] = [];
        transactionLinkCustomers.forEach((transaction) => {
            rootTransactions.push(transaction);
        });
        deviceLinkCustomers.forEach((customerLink) => {
            let deviceLink: api2Interfaces.RelatedCustomer = {
                relatedCustomerId: customerLink,
                relationType: 'DEVICE'
            }
            rootTransactions.push(deviceLink);
        });

        relatedCustomers = {relatedTransactions : rootTransactions};
        
        return relatedCustomers;
    }

}