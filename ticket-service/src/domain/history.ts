export interface TicketHistoryRepository {
  create: (history: TicketHistory) => Promise<TicketHistory>;
  get: (historyId: string) => Promise<TicketHistory | null>;
}

type Param = {
  historyId: string;
  userId: string;
  ticketId: string;
  amount: number;
  grantedAt: number;
};

export class TicketHistory {
  public readonly historyId: string;
  public readonly ticketId: string;
  public readonly userId: string;
  public readonly amount: number;
  public readonly grantedAt: number;

  constructor({ historyId, userId, ticketId, amount, grantedAt }: Param) {
    this.historyId = historyId;
    this.userId = userId;
    this.ticketId = ticketId;
    this.amount = amount;
    this.grantedAt = grantedAt;
  }
}
