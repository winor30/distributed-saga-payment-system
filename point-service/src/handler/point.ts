import { RequestHandler } from 'express';
import { PaymentEvent } from 'src/domain/event';
import { PointConsumer } from 'src/service/pointConsumer';
import { PointEventPublisher } from 'src/service/pointEventPublisher';
import { PointRefunder } from 'src/service/pointRefunder';
import { HttpError } from 'src/util/error';

export default class PointHandler {
  constructor(
    private readonly consumer: PointConsumer,
    private readonly refunder: PointRefunder,
    private readonly publisher: PointEventPublisher
  ) {}

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
      await this.publisher.publishFailed(eventData);
      throw new HttpError(errorMsg, 500);
    }

    await this.publisher.publishConsumed(eventData, consumedResult.history);

    res.send({ msg: 'ok' });
  };

  refundPoint: RequestHandler<any, any, PaymentEvent> = async (req, res) => {
    const eventData = req.body;
    const { id } = eventData;
    if (!id) {
      const errorMsg = `invalid required parameter. historyId: ${id}`;
      throw new HttpError(errorMsg, 400);
    }

    const historyId = id;
    const refundedResult = await this.refunder.refund(historyId).catch((err: Error) => err);
    if (refundedResult instanceof Error) {
      const errorMsg = `failed consume point. reason: ${refundedResult.message}`;
      console.error(refundedResult);
      throw new HttpError(errorMsg, 500);
    }

    await this.publisher.publishRefunded(eventData, refundedResult.history);

    res.send({ msg: 'ok' });
  };
}
