import express, {Application, Request, Response} from 'express';
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

    // start function used to handle IO. it gets input, runs the neccesary functions and gets required output
    async start(customerId: number) {
        // open express lister for port 3000
        this.exp.listen(this.port, ()=> {
            console.log(`Connected successfully on port ${this.port}`);
        });

        // get transactions with fetchData
        let transactions = await fetchData();
        let filteredTransactions: transactionInterfaces.Transaction[] = [];
            // checks if customerId exists, transactions exist, and that it is populated
            if (customerId && transactions && transactions.length > 0) {
                // compact code to collect all the transactions made by a particular user
                filteredTransactions = transactions.filter((transaction: { customerId: number }) => transaction.customerId === customerId);

                // we populate these lists sequentially
                let deviceArray: string[] = await this.getDevices(filteredTransactions);
                let deviceLinkCustomers: number[] = await this.findDeviceLink(transactions, deviceArray, customerId);
                let p2PArray: api2Interfaces.P2PData[] = await this.getP2PTransactions(filteredTransactions);
                let transactionLinkCustomers: api2Interfaces.RelatedCustomer[] = await this.findP2PLink(transactions, p2PArray);
                let finalOutput: api2Interfaces.RootObject = await this.buildRelatedCustomers(deviceLinkCustomers, transactionLinkCustomers);

                // and then we use the sendOutput function to send out our output
                sendOutput(finalOutput, this.exp);

            } else { // send an empty output
                let finalOutput: api2Interfaces.RootObject = {relatedTransactions: []}
                sendOutput(finalOutput, this.exp);
            }
    }  


    // we simply get every transaction that it P2P
    public async getP2PTransactions(filteredTransactions: transactionInterfaces.Transaction[]) {
        // create an empty list
        let result: api2Interfaces.P2PData[] = [];
        // if filteredTransactions is populated
        if (filteredTransactions.length > 0) {
            // iterate through filteredTransactions
            filteredTransactions.forEach((transaction) => {
                // check if transaction is P2P
                if (transaction.transactionType === 'P2P_SEND' || transaction.transactionType === 'P2P_RECEIVE') {
                    // we add the transaction to new P2P
                    let newP2P: api2Interfaces.P2PData = {
                        transactionType: transaction.transactionType,
                        transactionDate: transaction.transactionDate,
                        transactionAmount: transaction.amount
                    }
                    // then we push the newP2P to the array
                    result.push(newP2P);
                }
            });
        }

        // we return the result
        return result;
    }


    // this function is used to retrieve linked transactions 
    public async findP2PLink(allTransactions: transactionInterfaces.Transaction[], p2PArray: api2Interfaces.P2PData[]) {
        // create an empty list
        let p2PLinkCustomers: api2Interfaces.RelatedCustomer[] = [];
        // check if allTransactions is populated
        if (allTransactions && allTransactions.length > 0) {
            // we use a string value to essentially look for the opposite of what the current item is.
            // basically if we have a send we need to look for a receive
            let p2pLookFor: string;
            //iterate through allTransactions
            allTransactions.forEach((transaction) => {
                p2PArray.forEach((p2p) => {
                    // not using ! in case data does not properly align (alternatively we can use regex)
                    if (p2p.transactionType === 'P2P_SEND') {
                        p2pLookFor = 'P2P_RECEIVE';
                    } else if (p2p.transactionType === 'P2P_RECEIVE'){
                        p2pLookFor = 'P2P_SEND';
                    }

                    // we do a bunch of checks to make sure the transactions align with the origional. note the redundancy in checks. you can never be too safe
                    if (transaction.transactionType === p2pLookFor && transaction.transactionDate === p2p.transactionDate && Math.abs(transaction.amount) === Math.abs(p2p.transactionAmount)) {
                        // populate a new relatedCustomer interface
                        let newP2PLinkCustomer: api2Interfaces.RelatedCustomer = {
                            relatedCustomerId: transaction.customerId,
                            relationType: transaction.transactionType
                        }
                        // and push that interface
                        p2PLinkCustomers.push(newP2PLinkCustomer);
                    }
                });
            });
        }
        // we return the linked customers
        return p2PLinkCustomers;
    }


    // this function is used to retrieve transactions linked with devices
    public async getDevices(filteredTransactions: transactionInterfaces.Transaction[]) {
        // create an empty strign array
        let deviceArray: string[] = [];
        // check if filteredTransactions is populated
        if (filteredTransactions.length > 0) {
            // iterate through filteredTransactions
            filteredTransactions.forEach((transaction) => {
                if (transaction.metadata.deviceId) { // seperated ifs for readability
                    let deviceID: string = transaction.metadata.deviceId;
                    // if deviceId exists in metadata and is NOT included in the deviceArray we add it (so there are no duplicates)
                    if (!deviceArray.includes(deviceID)) {
                        deviceArray.push(deviceID);
                    }
                }
            });

        }
        // we return the non duplicated device array
        return deviceArray;
    }


    public async findDeviceLink(allTransactions: transactionInterfaces.Transaction[], deviceArray: string[], exludeId: number) {
        // create empty list
        let relatedIDs: number[] = [];
        // check if allTransactions is populated
        if (allTransactions && allTransactions.length > 0) {
            // iterate through allTransactions
            allTransactions.forEach((transaction) => {
                // if metadata has a deviceId and is in deviceArray and customerId is not in relatedIds and is not excluded
                if (transaction.metadata.deviceId) { // seperated ifs for readability
                    let deviceID: string = transaction.metadata.deviceId;
                    
                    if (deviceArray.includes(deviceID) && !relatedIDs.includes(transaction.customerId) && exludeId !== transaction.customerId) {
                        // push the customerId to relatedIDs
                        relatedIDs.push(transaction.customerId);
                    }
                }
            });
        }
        // return the relatedIDs
        return relatedIDs;
    }


    public async buildRelatedCustomers(deviceLinkCustomers: number[], transactionLinkCustomers: api2Interfaces.RelatedCustomer[]) {
        // create empty objects
        let relatedCustomers: api2Interfaces.RootObject;
        let rootTransactions: api2Interfaces.RelatedCustomer[] = [];
        // iterate through transactionLinkCustomers and push transactions to rootTransactions
        transactionLinkCustomers.forEach((transaction) => {
            rootTransactions.push(transaction);
        });
        // iterate through deviceLinkCustomers and populate deviceLink interface
        deviceLinkCustomers.forEach((customerLink) => {
            let deviceLink: api2Interfaces.RelatedCustomer = {
                relatedCustomerId: customerLink,
                relationType: 'DEVICE'
            }
            // push deviceLink to rootTransactions list
            rootTransactions.push(deviceLink);
        });

        // populate relatedCustomers
        relatedCustomers = {relatedTransactions : rootTransactions};
        
        // return result
        return relatedCustomers;
    }

}