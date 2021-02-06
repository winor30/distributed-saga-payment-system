import crypto from 'crypto';
import dayjs from 'dayjs';

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
    if (refundValue <= 0) {
      throw new Error('refund value is greater than zero');
    }

    const historyId = crypto.createHash('sha256').update(`refund-${this.historyId}`).digest('hex')
    return new PointHistory({
      historyId,
      userId: this.userId,
      value: refundValue,
      createdAt: dayjs().unix(),
    });
  };

  static consume = ({ userId, historyId, value }: Omit<Param, 'createdAt'>) => {
    const consumedValue = -value;
    if (consumedValue >= 0) {
      throw new Error('this history should consume history. value is less than zero')
    }
    return new PointHistory({
      historyId,
      userId,
      value: consumedValue,
      createdAt: dayjs().unix(),
    });
  }

  static fund = ({ userId, historyId, value }:Omit<Param, 'createdAt'>) => {
    if (value <= 0) {
      throw new Error('this history should fund history. value is greater than zero')
    }
    return new PointHistory({
      historyId,
      userId,
      value,
      createdAt: dayjs().unix(),
    });
  }
}
