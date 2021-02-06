import { PointAccount, PointHistory } from 'src/domain';
import { TransactionManager } from 'src/domain/transaction';
import { ServiceError } from 'src/util/error';

export class PointRefunder {
  constructor(private readonly transactionManager: TransactionManager) { }

  refund = async (historyId: string): Promise<{ history: PointHistory; account: PointAccount }> => {
    return this.transactionManager.runTransaction(async (tx) => {
      const accountRepository = tx.getAccountRepository();
      const historyRepository = tx.getHistoryRepository();

      // history
      const history = await historyRepository.get(historyId);
      if (!history) {
        throw new ServiceError('history is not found', 'abort');
      }

      // accountが存在するか確認
      const account = await accountRepository.get(history.userId);
      if (!account) {
        throw new ServiceError('account is empty', 'abort');
      }


      // historyに対するrefundなhistory生成
      const refundHistory = history.refund();

      // refundする
      const targetAccount = account.incrementBalance(refundHistory.value);
      const expectRefundHistory = await historyRepository.get(refundHistory.historyId);
      if (expectRefundHistory) {
        return { history: expectRefundHistory, account: targetAccount }
      }

      const updatedAccount = await accountRepository.update(targetAccount);

      // 履歴の更新
      const createdHistory = await historyRepository.create(refundHistory);
      return { history: createdHistory, account: updatedAccount };
    });
  };
}
