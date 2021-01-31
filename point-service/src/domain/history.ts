export interface PointHistoryRepository {
  create: (history: PointHistory) => Promise<PointHistory>;
  get: (historyId: string) => Promise<PointHistory | null>;
}

type Param = {
  historyId: string;
  value: number;
  createdAt: number;
};

export class PointHistory {
  public readonly historyId: string;
  public readonly value: number;
  public readonly createdAt: number;

  constructor({ historyId, value, createdAt }: Param) {
    this.historyId = historyId;
    this.value = value;
    this.createdAt = createdAt;
  }
}
