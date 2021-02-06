import firestore from '@google-cloud/firestore';
import { PointHistory, PointHistoryRepository } from 'src/domain';
import { HISTORIES_COL_NAME, ROOT_COL_NAME, VERSION_DOC_NAME } from './collection';

type FirestorePointHistory = {
  historyId: string;
  value: number;
  userId: string;
  createdAt: number;
}

export class TransactionalPointHistoryRepository implements PointHistoryRepository {
  constructor(private readonly firestore: firestore.Firestore, private readonly transaction: firestore.Transaction) { }
  private docRef = (historyId: string) => this.firestore.collection(ROOT_COL_NAME).doc(VERSION_DOC_NAME).collection(HISTORIES_COL_NAME).doc(historyId);

  get = async (historyId: string) => {
    const ref = this.docRef(historyId);
    const snap = await this.transaction.get(ref);
    const data = (snap.data() || null) as FirestorePointHistory | null

    if (!data) return null;
    return new PointHistory(data);
  }

  create = async (history: PointHistory) => {
    const ref = this.docRef(history.historyId);
    const data: FirestorePointHistory = {
      userId: history.userId,
      historyId: history.historyId,
      value: history.value,
      createdAt: history.createdAt
    }
    this.transaction.create(ref, data);

    return history;
  }
}
