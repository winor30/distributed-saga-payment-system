import { PubSub } from '@google-cloud/pubsub';
import { PointHistory } from 'src/domain';
import { Attributes, PaymentEvent } from 'src/domain/event';

const TOPIC_NAME = 'distributed-payment-system-topic';

export class PubSubClient {
  constructor(private readonly pubsub: PubSub) {}

  publishEvent = async (receivedData: PaymentEvent, history: PointHistory, eventType: Attributes['event_type']) => {
    const topic = this.pubsub.topic(TOPIC_NAME);
    const event = this.mergeHistory(receivedData, history);

    const attributes: Attributes = {
      event_type: eventType,
    };
    return topic.publishJSON(event, attributes);
  };

  private mergeHistory = (receivedData: PaymentEvent, history: PointHistory): PaymentEvent => ({
    ...receivedData,
    point: {
      userId: history.userId,
      historyId: history.historyId,
      value: history.value,
      createdAt: history.createdAt,
    },
  });
}
