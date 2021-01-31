import firestore from '@google-cloud/firestore';
import { TicketInventory, TicketInventoryRepository } from 'src/domain';
import { INVENTORIES_COL_NAME, ROOT_COL_NAME, VERSION_DOC_NAME } from './collection';

type FirestoreTicketInventory = {
  ticketId: string;
  stock: number;
  price: number;
}

export class TransactionalTicketInventoryRepository implements TicketInventoryRepository {
  constructor(private readonly firestore: firestore.Firestore, private readonly transaction: firestore.Transaction) { }
  private docRef = (ticketId: string) => this.firestore.collection(ROOT_COL_NAME).doc(VERSION_DOC_NAME).collection(INVENTORIES_COL_NAME).doc(ticketId);

  get = async (historyId: string) => {
    const ref = this.docRef(historyId);
    const snap = await this.transaction.get(ref);
    const data = (snap.data() || null) as FirestoreTicketInventory | null
    if (!data) return null;
    return new TicketInventory(data)
  }

  update = async (inventory: TicketInventory) => {
    const ref = this.docRef(inventory.ticketId);
    const data: FirestoreTicketInventory = {
      ticketId: inventory.ticketId,
      stock: inventory.stock,
      price: inventory.price,
    }
    this.transaction.update(ref, data);

    return inventory;
  }
}
