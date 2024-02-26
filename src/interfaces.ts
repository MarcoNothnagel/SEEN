// interfaces.ts
// this may be dangerous as interfaces will not be able to error during runtime
export interface Metadata {
    relatedTransactionId?: number;
    deviceId?: string;
  }

export interface Transaction {
  transactionId: number;
  authorizationCode: string;
  transactionDate: string;
  customerId: number;
  transactionType: string;
  transactionStatus: string;
  description: string;
  amount: number;
  metadata: Metadata;
}

export interface Timeline {
  createdAt: string;
  status: string;
  amount: number;
}

export interface TransactionFin {
  createdAt?: string;
  updatedAt?: string;
  transactionId?: number;
  authorizationCode?: string;
  status?: string;
  description?: string;
  transactionType?: string;
  metadata?: Metadata;
  timeline?: Timeline[];
}

export interface RootObject {
  transactions: TransactionFin[];
}


// interfaces for api2

export interface P2PData {
  transactionDate: string;
  transactionType: string;
  transactionAmount: number;
}

export interface RelatedCustomer {
  relatedCustomerId: number;
  relationType: string;
}

export interface RootRelated {
  relatedTransactions: RelatedCustomer[];
}