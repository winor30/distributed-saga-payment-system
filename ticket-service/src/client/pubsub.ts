import { PubSub } from '@google-cloud/pubsub';
import { TicketHistory } from 'src/domain';
import { Attributes, PaymentEvent } from 'src/domain/event';

const TOPIC_NAME = 'distributed-payment-system-topic';
const GRANTED_TICKET_EVENT = 'granted-ticket';

export class PubSubClient {
  constructor(private readonly pubsub: PubSub) { }

  publishGrantTicket = async (receivedData: PaymentEvent, history: TicketHistory) => {
    const topic = this.pubsub.topic(TOPIC_NAME);

    const event: PaymentEvent = {
      ...receivedData,
      ticket: history,
    };
    console.log(`receivedData, ${JSON.stringify(receivedData)}`)
    const attributes: Attributes = {
      event_type: GRANTED_TICKET_EVENT,
    }
    return topic.publishJSON(event, attributes);
  };
}
