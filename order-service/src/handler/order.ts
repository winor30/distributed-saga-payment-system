import { RequestHandler } from 'express';
import { FinishEventSubscriber } from 'src/service/finishOrderEventSubscriber';
import { PurchaseTicketOrderer } from 'src/service/purchaseTicketOrderer';
import { StartEventPublisher } from 'src/service/startOrderEventPublisher';
import { HttpError } from 'src/util/error';

export default class OrderHandler {
  constructor(
    private readonly orderer: PurchaseTicketOrderer,
    private readonly publisher: StartEventPublisher,
    private readonly subscriber: FinishEventSubscriber
  ) {}

  purchaseTicket: RequestHandler<any, any, { userId?: string; price?: number; ticketId?: string }> = async (
    req,
    res
  ) => {
    const { userId, price, ticketId } = req.body;
    if (!userId || !price || !ticketId) {
      const errorMsg = `invalid required parameter. userId: ${userId}, price: ${price}, ticketId: ${ticketId}`;
      throw new HttpError(errorMsg, 400);
    }

    const orderedResult = await this.orderer.order(userId, ticketId, price).catch((err: Error) => err);
    if (orderedResult instanceof Error) {
      const errorMsg = `failed order. reason: ${orderedResult.message}`;
      console.error(orderedResult);
      throw new HttpError(errorMsg, 500);
    }

    const order = orderedResult.order;

    await this.publisher.publishStart(order);

    await this.subscriber.subscribe(order);

    const result = await this.orderer.complete(order).catch((err: Error) => err);
    if (result instanceof Error) {
      const errorMsg = `failed complete order. reason: ${result.message}`;
      console.error(result);
      await this.publisher.publishCancel(order)
      throw new HttpError(errorMsg, 500);
    }

    res.send({ msg: 'ok' });
  };
}
