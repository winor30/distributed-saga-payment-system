import { PointAccountRepository } from './account';
import { PointHistoryRepository } from './history';

export interface Transaction {
  getAccountRepository: () => PointAccountRepository;
  getHistoryRepository: () => PointHistoryRepository;
}

export interface TransactionManager {
  runTransaction: <T>(fn: (transaction: Transaction) => Promise<T>) => Promise<T>;
}
