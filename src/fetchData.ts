import axios from 'axios';
import * as transactionInterfaces from './interfaces/transactionInterfaces';

export async function fetchData() {
    let transactions: transactionInterfaces.Transaction[] = [];
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