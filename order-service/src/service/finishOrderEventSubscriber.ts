import { PubSubClient } from 'src/client/pubsub';
import { Order } from 'src/domain';

export class FinishEventSubscriber {
  constructor(private readonly pubsub: PubSubClient) {}

  subscribe = (order: Order) => {
    return this.pubsub.subscribe(order);
  };
}
