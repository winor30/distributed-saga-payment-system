
export interface OrderRepository {
  get: (orderId: string) => Promise<Order | null>;
  create: (order: Order) => Promise<Order>;
  update: (order: Order) => Promise<Order>;
}

export type Status = 'pending' | 'complete' | 'cancel';

type Params = {
  orderId: string;
  userId: string;
  price: number;
  ticketId: string;
  purchasedAt: number;
  status: Status;
};

export class Order {
  public readonly orderId: string;
  public readonly userId: string;
  public readonly price: number;
  public readonly ticketId: string;
  public readonly purchasedAt: number;
  public readonly status: Status;

  constructor(param: Params) {
    this.orderId = param.orderId;
    this.userId = param.userId;
    this.price = param.price;
    this.ticketId = param.ticketId;
    this.purchasedAt = param.purchasedAt;
    this.status = param.status;
  }

  complete = () => {
    return this.updateStatus('complete')
  }

  cancel = () => {
    return this.updateStatus('cancel')
  }

  private updateStatus = (status: Status) => {
    return new Order({
      orderId: this.orderId,
      userId: this.userId,
      price: this.price,
      ticketId: this.ticketId,
      purchasedAt: this.purchasedAt,
      status: status,
    })
  }
}
