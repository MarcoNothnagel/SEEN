// This is shared interfaces for both API1 and API2

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