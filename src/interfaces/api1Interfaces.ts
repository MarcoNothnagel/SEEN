import * as transactionInterfaces from './transactionInterfaces';

// all of the unique interfaces used by api1

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
  metadata?: transactionInterfaces.Metadata;
  timeline?: Timeline[];
}

export interface RootObject {
  transactions: TransactionFin[];
}