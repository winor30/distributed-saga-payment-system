import { TicketHistoryRepository } from './history';
import { TicketInventoryRepository } from './inventory';
import { TicketRepository } from './ticket';

export interface Transaction {
  getTicketRepository: () => TicketRepository;
  getTicketInventoryRepository: () => TicketInventoryRepository;
  getTicketHistoryRepository: () => TicketHistoryRepository;
}

export interface TransactionManager {
  runTransaction: <T>(fn: (transaction: Transaction) => Promise<T>) => Promise<T>;
}
