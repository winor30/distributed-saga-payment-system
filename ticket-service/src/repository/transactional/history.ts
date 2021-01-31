import firestore from '@google-cloud/firestore';
import { TicketHistory, TicketHistoryRepository } from 'src/domain';
import { HISTORIES_COL_NAME, ROOT_COL_NAME, VERSION_DOC_NAME } from './collection';

type FirestoreTicketHistory = {
  historyId: string;
  userId: string;
  ticketId: string;
  amount: number;
  grantedAt: number;
}

export class TransactionalTicketHistoryRepository implements TicketHistoryRepository {
  constructor(private readonly firestore: firestore.Firestore, private readonly transaction: firestore.Transaction) { }
  private docRef = (historyId: string) => this.firestore.collection(ROOT_COL_NAME).doc(VERSION_DOC_NAME).collection(HISTORIES_COL_NAME).doc(historyId);

  get = async (historyId: string) => {
    const ref = this.docRef(historyId);
    const snap = await this.transaction.get(ref);
    const data = (snap.data() || null) as FirestoreTicketHistory | null

    if (!data) return null;
    return new TicketHistory(data);
  }

  create = async (history: TicketHistory) => {
    const ref = this.docRef(history.historyId);
    const data: FirestoreTicketHistory = {
      historyId: history.historyId,
      userId: history.userId,
      ticketId: history.ticketId,
      amount: history.amount,
      grantedAt: history.grantedAt
    }
    this.transaction.create(ref, data);

    return history;
  }
}
