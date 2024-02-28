import axios from 'axios';
import * as transactionInterfaces from '../interfaces/transactionInterfaces';

// simply used to fetch all data
export async function fetchData() {
    let transactions: transactionInterfaces.Transaction[] = [];
    try {
        // do an acios get call to read the json file
        const response = await axios.get('https://cdn.seen.com/challenge/transactions-v2.json');
        // populate the transactions interface with all transaction values
        transactions = response.data.map((item: any) => ({
            transactionId: item.transactionId,
            authorizationCode: item.authorizationCode,
            transactionDate: item.transactionDate,
            customerId: item.customerId,
            transactionType: item.transactionType,
            transactionStatus: item.transactionStatus,
            description: item.description,
            amount: Number(item.amount).toFixed(2), // enforce the value being of type number
            metadata: item.metadata
        }));

        return(transactions);   // return a list of all transactions
    
    // try catch with an error for when the data cannot be retreived
    } catch (error) {
        console.error('Error fetching data:', error); // might have to revise for touch ups
    }
}