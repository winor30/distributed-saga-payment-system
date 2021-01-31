import { PubSubClient } from 'src/client/pubsub';
import { TicketHistory } from 'src/domain';
import { PaymentEvent } from 'src/domain/event';

export class ConsumedEventPublisher {
  constructor(private readonly pubsub: PubSubClient) {}

  publish = (receivedData: PaymentEvent, history: TicketHistory) => {
    return this.pubsub.publishGrantTicket(receivedData, history);
  };
}
