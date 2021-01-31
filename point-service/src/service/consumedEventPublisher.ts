import { PubSubClient } from 'src/client/pubsub';
import { PointHistory } from 'src/domain';
import { PaymentEvent } from 'src/domain/event';

export class ConsumedEventPublisher {
  constructor(private readonly pubsub: PubSubClient) {}

  publish = (receivedData: PaymentEvent, history: PointHistory) => {
    return this.pubsub.publishConsumedPoint(receivedData, history);
  };
}
