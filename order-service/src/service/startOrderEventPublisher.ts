import { PubSubClient } from 'src/client/pubsub';
import { Order } from 'src/domain';

export class StartEventPublisher {
  constructor(private readonly pubsub: PubSubClient) {}

  publishStart = (order: Order) => {
    return this.pubsub.publishEvent('started-order', order);
  };

  publishCancel = (order: Order) => {
    return this.pubsub.publishEvent('stopped-order', order);
  };
}
