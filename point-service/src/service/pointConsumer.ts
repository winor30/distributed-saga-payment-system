import dayjs from 'dayjs';
import { PointAccount, PointHistory } from 'src/domain';
import { TransactionManager } from 'src/domain/transaction';

export class PointConsumer {
  constructor(private readonly transactionManager: TransactionManager) {}

  consume = async (
    userId: string,
    historyId: string,
    value: number
  ): Promise<{ history: PointHistory; account: PointAccount }> => {
    return this.transactionManager.runTransaction(async (tx) => {
      const accountRepository = tx.getAccountRepository();
      const historyRepository = tx.getHistoryRepository();

      // accountが存在するか確認
      const account = await accountRepository.get(userId);
      if (!account) {
        throw new Error('account is empty');
      }

      // historyがすでに存在するか確認
      // 冪等性を考慮すれば、すでに存在したらreturnする
      const currentHistory = await historyRepository.get(historyId);
      if (currentHistory) {
        const msg = `${historyId} is already`;
        console.log(msg);
        return { account, history: currentHistory };
      }

      // 残高を減らす
      const targetAccount = account.incrementBalance(-value);
      const updatedAccount = await accountRepository.update(targetAccount);

      // 履歴の更新
      const createdAt = dayjs().unix();
      const history = new PointHistory({ historyId, createdAt, value, userId });
      const createdHistory = await historyRepository.create(history);
      return { history: createdHistory, account: updatedAccount };
    });
  };
}
