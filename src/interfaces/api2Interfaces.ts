// all of the unique interfaces used by api2

export interface P2PData {
  transactionDate: string;
  transactionType: string;
  transactionAmount: number;
}

export interface RelatedCustomer {
  relatedCustomerId: number;
  relationType: string;
}

export interface RootObject {
  relatedTransactions: RelatedCustomer[];
}