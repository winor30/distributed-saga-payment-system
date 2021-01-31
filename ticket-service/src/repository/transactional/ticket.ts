import firestore from '@google-cloud/firestore';
import { Ticket, TicketRepository } from 'src/domain';
import { ROOT_COL_NAME, TICKETS_COL_NAME, USERS_COL_NAME, VERSION_DOC_NAME } from './collection';

type FirestoreTicket = {
  userId: string;
  ticketId: string;
  count: number;
}

export class TransactionalTicketRepository implements TicketRepository {
  constructor(private readonly firestore: firestore.Firestore, private readonly transaction: firestore.Transaction) { }
  private docRef = (userId: string, ticketId: string) => this.firestore.collection(ROOT_COL_NAME).doc(VERSION_DOC_NAME).collection(USERS_COL_NAME).doc(userId).collection(TICKETS_COL_NAME).doc(ticketId);

  get = async (userId: string, ticketId: string) => {
    const ref = this.docRef(userId, ticketId);
    const snap = await this.transaction.get(ref);
    const data = (snap.data() || null) as FirestoreTicket | null

    if (!data) return null;
    return new Ticket(data);
  }

  create = async (ticket: Ticket) => {
    const ref = this.docRef(ticket.userId, ticket.ticketId);
    const data: FirestoreTicket = {
      userId: ticket.userId,
      ticketId: ticket.ticketId,
      count: ticket.count,
    }
    this.transaction.create(ref, data);

    return ticket;
  }

  update = async (ticket: Ticket) => {
    const ref = this.docRef(ticket.userId, ticket.ticketId);
    const data: FirestoreTicket = {
      userId: ticket.userId,
      ticketId: ticket.ticketId,
      count: ticket.count,
    }
    this.transaction.update(ref, data);

    return ticket;
  }
}
