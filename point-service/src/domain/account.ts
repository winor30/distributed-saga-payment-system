export interface PointAccountRepository {
  update: (account: PointAccount) => Promise<PointAccount>;
  get: (userId: string) => Promise<PointAccount | null>;
}

type Params = {
  userId: string;
  balance: number;
};

export class PointAccount {
  public readonly userId: string;
  public readonly balance: number;

  constructor({ userId, balance }: Params) {
    this.userId = userId;
    this.balance = balance;
  }

  incrementBalance = (amount: number): PointAccount => {
    const balance = this.balance + amount;
    const userId = this.userId;
    if (balance < 0) {
      throw new Error('balance is less than zero');
    }
    return new PointAccount({ userId, balance });
  };
}
