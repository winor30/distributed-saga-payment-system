import dayjs from 'dayjs';
import { Order, OrderRepository } from 'src/domain';
import generateRandomString from 'src/util/random';

export class PurchaseTicketOrderer {
  constructor(private readonly repository: OrderRepository) {}

  order = async (userId: string, ticketId: string, price: number): Promise<{ order: Order }> => {
    const orderId = generateRandomString();
    const purchasedAt = dayjs().unix();
    const order = new Order({
      orderId,
      userId,
      price,
      ticketId,
      purchasedAt,
      status: 'pending',
    });
    await this.repository.create(order);

    return { order };
  };

  complete = async (order: Order) => {
    await this.repository.update(order.complete())
  }
}
