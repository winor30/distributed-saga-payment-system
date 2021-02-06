import { PubSubClient } from 'src/client/pubsub';
import { TicketHistory } from 'src/domain';
import { PaymentEvent } from 'src/domain/event';

export class GrantedEventPublisher {
  constructor(private readonly pubsub: PubSubClient) {}

  publishGranted = (receivedData: PaymentEvent, history: TicketHistory) => {
    return this.pubsub.publishEvent('granted-ticket', receivedData, history);
  };

  publishCanceled = (receivedData: PaymentEvent, history: TicketHistory) => {
    return this.pubsub.publishEvent('canceled-ticket', receivedData, history);
  };

  publishFailed = (receivedData: PaymentEvent) => {
    return this.pubsub.publishEvent('failed-ticket', receivedData);
  };
}
