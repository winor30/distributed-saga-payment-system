import { PubSubClient } from 'src/client/pubsub';
import { TicketHistory } from 'src/domain';
import { PaymentEvent } from 'src/domain/event';

export class GrantedEventPublisher {
  constructor(private readonly pubsub: PubSubClient) {}

  publishGranted = (receivedData: PaymentEvent, history: TicketHistory) => {
    return this.pubsub.publishEvent(receivedData, history, 'granted-ticket');
  };

  publishCanceled = (receivedData: PaymentEvent, history: TicketHistory) => {
    return this.pubsub.publishEvent(receivedData, history, 'canceled-ticket');
  };
}
