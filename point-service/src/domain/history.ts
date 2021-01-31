import dayjs from 'dayjs';
import generateRandomString from 'src/util/random';

export interface PointHistoryRepository {
  create: (history: PointHistory) => Promise<PointHistory>;
  get: (historyId: string) => Promise<PointHistory | null>;
}

type Param = {
  userId: string;
  historyId: string;
  value: number;
  createdAt: number;
};

export class PointHistory {
  public readonly userId: string;
  public readonly historyId: string;
  public readonly value: number;
  public readonly createdAt: number;

  constructor({ userId, historyId, value, createdAt }: Param) {
    this.userId = userId;
    this.historyId = historyId;
    this.value = value;
    this.createdAt = createdAt;
  }

  refund = () => {
    const refundValue = -this.value;
    if (refundValue < 0) {
      throw new Error('refund value is less than zero');
    }
    const historyId = generateRandomString();
    return new PointHistory({
      historyId,
      userId: this.userId,
      value: refundValue,
      createdAt: dayjs().unix(),
    });
  };
}
