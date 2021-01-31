import { RequestHandler } from 'express';
import { PaymentEvent } from 'src/domain/event';
import { GrantedEventPublisher } from 'src/service/grantedEventPublisher';
import { TicketCanceller } from 'src/service/ticketCanceller';
import { TicketGranter } from 'src/service/ticketGranter';
import { HttpError } from 'src/util/error';

export default class TicketHandler {
  constructor(
    private readonly granter: TicketGranter,
    private readonly canceller: TicketCanceller,
    private readonly publisher: GrantedEventPublisher
  ) {}

  grantTicket: RequestHandler<any, any, PaymentEvent> = async (req, res) => {
    const eventData = req.body;
    const { id, order, point } = eventData;
    if (!order?.userId || !id || !order?.ticketId || !point?.value) {
      const errorMsg = `invalid required parameter. userId: ${order?.userId}, orderId: ${id}, ticketId: ${order?.ticketId}, point.value: ${point?.value}`;
      throw new HttpError(errorMsg, 400);
    }

    const grantedResult = await this.granter
      .grant(id, order.userId, order.ticketId, point.value)
      .catch((err: Error) => err);
    if (grantedResult instanceof Error) {
      const errorMsg = `failed grant ticket. reason: ${grantedResult.message}`;
      console.error(grantedResult);
      throw new HttpError(errorMsg, 500);
    }

    await this.publisher.publishGranted(eventData, grantedResult.history);

    res.send({ msg: 'ok' });
  };

  cancelTicket: RequestHandler<any, any, PaymentEvent> = async (req, res) => {
    const eventData = req.body;
    const { id } = eventData;
    if (!id) {
      const errorMsg = `invalid required parameter. orderId: ${id}`;
      throw new HttpError(errorMsg, 400);
    }

    const grantedResult = await this.canceller.cancel(id).catch((err: Error) => err);
    if (grantedResult instanceof Error) {
      const errorMsg = `failed cancel ticket. reason: ${grantedResult.message}`;
      console.error(grantedResult);
      throw new HttpError(errorMsg, 500);
    }

    await this.publisher.publishCanceled(eventData, grantedResult.history);

    res.send({ msg: 'ok' });
  };
}
