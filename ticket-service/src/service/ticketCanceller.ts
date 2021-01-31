import { Ticket, TicketHistory, TicketInventory } from 'src/domain';
import { TransactionManager } from 'src/domain/transaction';

export class TicketCanceller {
  constructor(private readonly transactionManager: TransactionManager) {}

  cancel = async (orderId: string): Promise<{ ticket: Ticket; inventory: TicketInventory; history: TicketHistory }> => {
    return this.transactionManager.runTransaction(async (tx) => {
      const ticketRepository = tx.getTicketRepository();
      const inventoryRepository = tx.getTicketInventoryRepository();
      const historyRepository = tx.getTicketHistoryRepository();

      // historyがあるか確認
      const currentHistory = await historyRepository.get(orderId);
      if (!currentHistory) {
        throw new Error('history is null');
      }

      // ticket inventory取得
      const currentInventory = await inventoryRepository.get(currentHistory.ticketId);
      if (!currentInventory) {
        const msg = `inventory is null. ticketId ${currentHistory.ticketId}`;
        throw new Error(msg);
      }

      // ticket情報取得
      const currentTicket = await ticketRepository.get(currentHistory.userId, currentHistory.ticketId);
      if (!currentTicket) {
        const msg = `ticket is null. ticketId ${currentHistory.ticketId}`;
        throw new Error(msg);
      }

      // cancelしたhistoryを作成
      const canceledHistory = await historyRepository.create(currentHistory.cancel());
      // inventoryに残数を追加して戻した情報を追加
      const incrementedInventory = await inventoryRepository.update(
        currentInventory.incrementStock(canceledHistory.amount)
      );
      // ticket情報を減らす
      const decrementedTicket = await ticketRepository.update(currentTicket.decrementCount(canceledHistory.amount));

      return { history: canceledHistory, ticket: decrementedTicket, inventory: incrementedInventory };
    });
  };
}
