import firestore from '@google-cloud/firestore';
import { PointAccount, PointAccountRepository } from 'src/domain';
import { ACCOUNTS_COL_NAME, ROOT_COL_NAME, VERSION_DOC_NAME } from './collection';

type FirestorePointAccount = {
  userId: string;
  balance: number;
}

export class TransactionalPointAccountRepository implements PointAccountRepository {
  constructor(private readonly firestore: firestore.Firestore, private readonly transaction: firestore.Transaction) {}
  private docRef = (userId: string) => this.firestore.collection(ROOT_COL_NAME).doc(VERSION_DOC_NAME).collection(ACCOUNTS_COL_NAME).doc(userId);

  get = async (userId: string) => {
    const ref = this.docRef(userId);
    const snap = await this.transaction.get(ref);

    const data = (snap.data() || null) as FirestorePointAccount | null
    if (!data) return null;
    return new PointAccount(data);
  }

  update = async (account: PointAccount) => {
    const ref = this.docRef(account.userId);
    const data: FirestorePointAccount = {
      userId: account.userId,
      balance: account.balance,
    }
    this.transaction.update(ref, data)

    return account;
  }
}
