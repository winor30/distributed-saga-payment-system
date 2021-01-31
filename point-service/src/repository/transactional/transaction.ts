import firestore from '@google-cloud/firestore';
import { Transaction, TransactionManager } from "src/domain";
import { TransactionalPointAccountRepository } from './account';
import { TransactionalPointHistoryRepository } from './history';

export class FirestoreTransactionManager implements TransactionManager {

  constructor(private readonly firestore: firestore.Firestore) {}

  private convertTransaction = (tx: firestore.Transaction): Transaction => ({
    getAccountRepository: () => new TransactionalPointAccountRepository(this.firestore, tx),
    getHistoryRepository: () => new TransactionalPointHistoryRepository(this.firestore, tx),
  })

  runTransaction = async <T>(fn: (tx: Transaction) => Promise<T>) => {
    return this.firestore.runTransaction(firestoreTx => {
      const tx = this.convertTransaction(firestoreTx);
      return fn(tx);
    })
  }
}
