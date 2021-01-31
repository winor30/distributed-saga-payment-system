import { OrderRepository } from './order';

export interface Transaction {
  getOrderRepository: () => OrderRepository;
}

export interface TransactionManager {
  runTransaction: <T>(fn: (transaction: Transaction) => Promise<T>) => Promise<T>;
}
