import { PubSub } from '@google-cloud/pubsub';
import { Order } from 'src/domain';
import { Attributes, PaymentEvent } from 'src/domain/event';

const TOPIC_NAME = 'distributed-payment-system-topic';
const ORDER_SERVICE_SUBSCRIPTION = 'order-subscription';
const STARTED_ORDER_EVENT = 'started-order';

export class PubSubClient {
  constructor(private readonly pubsub: PubSub) { }

  publishOrder = async (order: Order) => {
    const topic = this.pubsub.topic(TOPIC_NAME);

    const event: PaymentEvent = {
      id: order.orderId,
      order: {
        orderId: order.orderId,
        userId: order.userId,
        price: order.price,
        ticketId: order.ticketId,
        purchasedAt: order.purchasedAt,
        status: order.status,
      },
    };
    const attributes: Attributes = {
      event_type: STARTED_ORDER_EVENT
    }
    return topic.publishJSON(event, attributes);
  };

  subscribe = async (order: Order) => {
    console.log('start subscribe', JSON.stringify(order))
    const subscription = this.pubsub.topic(TOPIC_NAME).subscription(ORDER_SERVICE_SUBSCRIPTION);

    return new Promise<{ id: string }>((resolve, reject) => {
      const onMessage = (message: { data?: string | Buffer; ack?: () => void }) => {
        if (!message?.data) {
          return;
        }
        const msgData = typeof message.data === 'string' ? message.data : message.data.toString();
        console.log('data', msgData)
        let event: PaymentEvent | null = null;
        try {
          event = JSON.parse(msgData);
        } catch (err) {
          console.error(err);
        }
        console.log(event);
        if (!event) {
          console.error(`data is undefined`);
          return;
        }
        const orderId = event.id;
        if (order.orderId !== orderId) {
          console.log(`order.orderId: ${order.orderId}, orderId: ${orderId}`)
          return;
        }

        if (message.ack) message.ack()
        subscription.removeListener('message', onMessage);
        resolve({ id: orderId });
      };
      subscription.on('message', onMessage);

      subscription.on('error', (error: Error) => {
        subscription.removeListener('message', onMessage);
        reject(error);
      });

      setTimeout(() => {
        subscription.removeListener('message', onMessage);
        reject(new Error('timeout'));
      }, 30000);
    });
  };
}
