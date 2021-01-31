import { PubSubClient } from 'src/client/pubsub';
import { PointHistory } from 'src/domain';
import { PaymentEvent } from 'src/domain/event';

export class PointEventPublisher {
  constructor(private readonly pubsub: PubSubClient) {}

  publishConsumed = (receivedData: PaymentEvent, history: PointHistory) => {
    return this.pubsub.publishEvent(receivedData, history, 'consumed-point');
  };

  publishRefunded = (receivedData: PaymentEvent, history: PointHistory) => {
    return this.pubsub.publishEvent(receivedData, history, 'refunded-point');
  };
}
