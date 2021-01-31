type Status = 'pending' | 'complete' | 'cancel';

export type PaymentEvent = {
  id: string;
  order?: {
    orderId: string;
    userId: string;
    price: number;
    ticketId: string;
    purchasedAt: number;
    status: Status;
  };
  point?: {
    historyId: string;
    value: number;
    createdAt: number;
  };
  ticket?: {
    historyId: string;
    userId: string;
    ticketId: string;
    amount: number;
    grantedAt: number;
  };
};

type EventType = 'started-order' | 'consumed-point' | 'granted-ticket';
export type Attributes = {
  event_type: EventType;
};