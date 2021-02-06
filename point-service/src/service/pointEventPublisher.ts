import { PubSubClient } from 'src/client/pubsub';
import { PointHistory } from 'src/domain';
import { PaymentEvent } from 'src/domain/event';

export class PointEventPublisher {
  constructor(private readonly pubsub: PubSubClient) {}

  publishConsumed = (receivedData: PaymentEvent, history: PointHistory) => {
    return this.pubsub.publishEvent('consumed-point', receivedData, history);
  };

  publishRefunded = (receivedData: PaymentEvent, history: PointHistory) => {
    return this.pubsub.publishEvent('refunded-point', receivedData, history);
  };

  publishFailed = (receivedData: PaymentEvent) => {
    return this.pubsub.publishEvent('failed-point', receivedData);
  };
}
