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
    userId: string;
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

type EventType =
  | 'started-order'
  | 'stopped-order'
  | 'consumed-point'
  | 'refunded-point'
  | 'failed-point'
  | 'granted-ticket'
  | 'canceled-ticket'
  | 'failed-ticket';

export type Attributes = {
  event_type: EventType;
};
