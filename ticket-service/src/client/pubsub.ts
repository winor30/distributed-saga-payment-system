import { PubSub } from '@google-cloud/pubsub';
import { TicketHistory } from 'src/domain';
import { Attributes, PaymentEvent } from 'src/domain/event';

const TOPIC_NAME = 'distributed-payment-system-topic';

export class PubSubClient {
  constructor(private readonly pubsub: PubSub) { }

  publishEvent = async (eventType: Attributes['event_type'], receivedData: PaymentEvent, history?: TicketHistory) => {
    const topic = this.pubsub.topic(TOPIC_NAME);
    const event = this.mergeHistory(receivedData, history);

    const attributes: Attributes = {
      event_type: eventType,
    };
    return topic.publishJSON(event, attributes);
  };

  private mergeHistory = (receivedData: PaymentEvent, history?: TicketHistory): PaymentEvent => (history ? {
    ...receivedData,
    ticket: {
      userId: history.userId,
      historyId: history.historyId,
      ticketId: history.ticketId,
      amount: history.amount,
      grantedAt: history.grantedAt,
    },
  } : receivedData);
}
