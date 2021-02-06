import dayjs from 'dayjs';
import { Ticket, TicketHistory, TicketInventory, TicketRepository } from 'src/domain';
import { TransactionManager } from 'src/domain/transaction';

export class TicketGranter {
  constructor(private readonly transactionManager: TransactionManager) {}

  grant = async (
    orderId: string,
    userId: string,
    ticketId: string,
    totalPrice: number
  ): Promise<{ ticket: Ticket; inventory: TicketInventory; history: TicketHistory }> => {
    return this.transactionManager.runTransaction(async (tx) => {
      const ticketRepository = tx.getTicketRepository();
      const inventoryRepository = tx.getTicketInventoryRepository();
      const historyRepository = tx.getTicketHistoryRepository();

      // ticket inventory取得
      const inventory = await inventoryRepository.get(ticketId);
      if (!inventory) {
        const msg = `inventory is null. ticketId ${ticketId}`;
        throw new Error(msg);
      }

      const currentHistory = await historyRepository.get(orderId);
      const currentTicket = await ticketRepository.get(userId, ticketId);
      if (currentHistory && currentTicket) {
        console.log('already granted ticket');
        return { ticket: currentTicket, inventory, history: currentHistory };
      }

      // 購入数は1
      const count = 1;
      if (!inventory.verifyOrder(totalPrice, count)) {
        const msg = `invalid grant ticket paramter. totalPrice: ${totalPrice}, count: ${count}, expectedTotalPrice: ${inventory.totalPrice(
          count
        )}`;
        throw new Error(msg);
      }

      // 残チケットが0以下にならないか確認
      const decrementInventory = inventory.decrementStock(count);

      // ticketの所持数を更新
      const ticket = await this.updateOrCreateTicket(ticketRepository, count, currentTicket, userId, ticketId);

      const grantedAt = dayjs().unix();
      // historyを追加
      const history = new TicketHistory({
        historyId: orderId,
        ticketId,
        userId,
        amount: count,
        grantedAt,
      });
      const createdHistory = await historyRepository.create(history);

      const updatedInventory = await inventoryRepository.update(decrementInventory);

      return { history: createdHistory, ticket, inventory: updatedInventory };
    });
  };

  private updateOrCreateTicket = (
    ticketRepository: TicketRepository,
    count: number,
    ticket: Ticket | null,
    userId: string,
    ticketId: string
  ) => {
    if (ticket) {
      const incrementedTicket = ticket.incrementCount(count);
      return ticketRepository.update(incrementedTicket);
    } else {
      const createdTicket = new Ticket({ userId, ticketId, count });
      return ticketRepository.create(createdTicket);
    }
  };
}
