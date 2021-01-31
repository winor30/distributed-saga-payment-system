import { PubSubClient } from 'src/client/pubsub';
import { Order } from 'src/domain';

export class StartEventPublisher {
  constructor(private readonly pubsub: PubSubClient) {}

  publish = (order: Order) => {
    return this.pubsub.publishOrder(order);
  };
}
