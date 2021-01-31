import { RequestHandler } from 'express';
import { PaymentEvent } from 'src/domain/event';
import { ConsumedEventPublisher } from 'src/service/consumedEventPublisher';
import { PointConsumer } from 'src/service/pointConsumer';
import HttpError from 'src/util/error';

export default class PointHandler {
  constructor(private readonly consumer: PointConsumer, private readonly publisher: ConsumedEventPublisher) {}

  consumePoint: RequestHandler<any, any, PaymentEvent> = async (req, res) => {
    const eventData = req.body;
    const { id, order } = eventData;
    if (!order?.userId || !order?.price || !id) {
      const errorMsg = `invalid required parameter. userId: ${order?.userId}, amount: ${order?.price}, historyId: ${id}`;
      throw new HttpError(errorMsg, 400);
    }

    const historyId = id;
    const consumedResult = await this.consumer.consume(order.userId, historyId, order.price).catch((err: Error) => err);
    if (consumedResult instanceof Error) {
      const errorMsg = `failed consume point. reason: ${consumedResult.message}`;
      console.error(consumedResult);
      throw new HttpError(errorMsg, 500);
    }

    await this.publisher.publish(eventData, consumedResult.history);

    res.send({ msg: 'ok' });
  };
}
