export interface TicketInventoryRepository {
  get: (ticketId: string) => Promise<TicketInventory | null>;
  update: (inventory: TicketInventory) => Promise<TicketInventory>;
}

type Params = {
  ticketId: string;
  stock: number;
  price: number;
};

export class TicketInventory {
  public readonly ticketId: string;
  public readonly stock: number;
  public readonly price: number;

  constructor({ ticketId, stock, price }: Params) {
    this.ticketId = ticketId;
    this.stock = stock;
    this.price = price;
  }

  decrementStock = (count: number): TicketInventory => {
    const stock = this.stock - count;
    if (stock < 0) {
      throw new Error('stock is less than zero');
    }
    const ticketId = this.ticketId;
    const price = this.price;
    return new TicketInventory({ ticketId, price, stock });
  };

  incrementStock = (count: number): TicketInventory => {
    const stock = this.stock + count;
    if (stock < 0) {
      throw new Error('stock is less than zero');
    }
    const ticketId = this.ticketId;
    const price = this.price;
    return new TicketInventory({ ticketId, price, stock });
  };

  verifyOrder = (totalPrice: number, count: number): boolean => {
    return totalPrice === this.totalPrice(count);
  };

  totalPrice = (count: number): number => count * this.price;
}
