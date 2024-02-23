import express, {Application, Request, Response} from 'express';
import axios from 'axios';
import * as readline from 'readline';
import * as Interfaces from './interfaces';

const exp: Application = express();
const port: number = 3000;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const serverPromise = new Promise<void>((resolve, reject) => {
    exp.listen(port, ()=> {
        console.log(`Connected successfully on port ${port}`);
        resolve();
    });
});


let transactions: Interfaces.Transaction[] = [];

async function fetchData() {
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

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// filter by console input
async function startFilter() {
    let filteredTransactions: Interfaces.Transaction[] = [];
    serverPromise.then(() => {
        rl.question('Enter the customer ID: ', (customerId: string) => {
            if (customerId != "0"){
                console.log(`Customer ID entered: ${customerId}`);
                filteredTransactions = transactions.filter(transaction => transaction.customerId === parseInt(customerId));
                console.log(filteredTransactions);
            } else {
                rl.close();
                process.exit();
            }

        });
    }); 
}   


function sendOutput(): void {
    exp.get('/', (req: Request, res: Response) => {
        if (transactions) {
            res.json(transactions);
        } else {
            res.status(500).json({ error: 'Data not fetched yet' });
        }
    });
    console.log("output sent, check Postman. GET at http://localhost:3000");
    // rl.close();
    // startFilter();
}

fetchData();
startFilter();
sendOutput();
