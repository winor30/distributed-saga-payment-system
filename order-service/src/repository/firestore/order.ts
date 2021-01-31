import firestore from '@google-cloud/firestore';
import { Order, OrderRepository, Status } from 'src/domain';
import { ORDERS_COL_NAME, ROOT_COL_NAME, VERSION_DOC_NAME } from './collection';

type FirestoreOrder = {
  orderId: string;
  userId: string;
  price: number;
  ticketId: string;
  purchasedAt: number;
  status: Status;
}

export class FirestoreOrderRepository implements OrderRepository {
  constructor(private readonly firestore: firestore.Firestore) {}
  private docRef = (orderId: string) => this.firestore.collection(ROOT_COL_NAME).doc(VERSION_DOC_NAME).collection(ORDERS_COL_NAME).doc(orderId);

  get = async (orderId: string) => {
    const ref = this.docRef(orderId);
    const snap = await ref.get();

    const data = (snap.data() || null) as FirestoreOrder | null
    if (!data) return null;

    return new Order(data);
  }

  create = async (order: Order) => {
    const ref = this.docRef(order.orderId);
    const data: FirestoreOrder = this.toFirestoreData(order)
    await ref.create(data)
    return order;
  }

  update = async (order: Order) => {
    const ref = this.docRef(order.orderId);
    const data: FirestoreOrder = this.toFirestoreData(order)
    await ref.update(data)
    return order;
  }

  private toFirestoreData = (order: Order): FirestoreOrder => {
    return {
      orderId: order.orderId,
      userId: order.userId,
      price: order.price,
      ticketId: order.ticketId,
      purchasedAt: order.purchasedAt,
      status: order.status
    }
  }
}
