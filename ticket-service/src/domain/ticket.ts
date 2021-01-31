export interface TicketRepository {
  get: (userId: string, ticketId: string) => Promise<Ticket | null>;
  create: (ticket: Ticket) => Promise<Ticket>;
  update: (ticket: Ticket) => Promise<Ticket>;
}

type Params = {
  userId: string;
  ticketId: string;
  count: number;
};

export class Ticket {
  public readonly userId: string;
  public readonly ticketId: string;
  public readonly count: number;

  constructor({ userId, ticketId, count }: Params) {
    this.userId = userId;
    this.ticketId = ticketId;
    this.count = count;
  }

  incrementCount = (value: number) => {
    const userId = this.userId;
    const ticketId = this.ticketId;
    const count = this.count - value;
    if (count < 0) {
      throw new Error("ticket's count is less than zero");
    }
    return new Ticket({ userId, ticketId, count });
  };
}
