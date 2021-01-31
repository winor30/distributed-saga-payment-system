import { PubSub } from '@google-cloud/pubsub';
import { PointHistory } from 'src/domain';
import { Attributes, PaymentEvent } from 'src/domain/event';

const TOPIC_NAME = 'distributed-payment-system-topic';
const CONSUMED_POINT_EVENT = 'consumed-point';

export class PubSubClient {
  constructor(private readonly pubsub: PubSub) { }

  publishConsumedPoint = async (receivedData: PaymentEvent, history: PointHistory) => {
    const topic = this.pubsub.topic(TOPIC_NAME);
    const event: PaymentEvent = {
      ...receivedData,
      point: history,
    };

    console.log(`receivedData, ${JSON.stringify(receivedData)}`)
    const attributes: Attributes = {
      event_type: CONSUMED_POINT_EVENT,
    }
    return topic.publishJSON(event, attributes);
  };
}
