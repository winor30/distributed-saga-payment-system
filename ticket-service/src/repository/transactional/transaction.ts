import firestore from '@google-cloud/firestore';
import { Transaction, TransactionManager } from "src/domain";
import { TransactionalTicketHistoryRepository } from './history';
import { TransactionalTicketInventoryRepository } from './inventory';
import { TransactionalTicketRepository } from './ticket';

export class FirestoreTransactionManager implements TransactionManager {

  constructor(private readonly firestore: firestore.Firestore) {}

  private convertTransaction = (tx: firestore.Transaction): Transaction => ({
    getTicketRepository: () => new TransactionalTicketRepository(this.firestore, tx),
    getTicketHistoryRepository: () => new TransactionalTicketHistoryRepository(this.firestore, tx),
    getTicketInventoryRepository: () => new TransactionalTicketInventoryRepository(this.firestore, tx),
  })

  runTransaction = async <T>(fn: (tx: Transaction) => Promise<T>) => {
    return this.firestore.runTransaction(firestoreTx => {
      const tx = this.convertTransaction(firestoreTx);
      return fn(tx);
    })
  }
}
