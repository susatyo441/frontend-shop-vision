export interface ICreateTransaction {
  data: ICreateTransactionAttr[];
}

export interface ICreateTransactionAttr {
  productID: string;
  quantity: number;
  variantName?: string | null;
}

export interface ITransactionProductAttr {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  coverPhoto: string;
  category: {
    _id?: string;
    name?: string;
    key?: number;
  };
}

export interface ITransaction {
  _id: string;
  createdAt: string;
  updatedAt: string;
  totalPrice: number;
  storeId: string;
  products: ITransactionProductAttr[];
  displayDate?: string;
}

export interface ITransactionSummary {
  totalOrder: number;
  totalOrderThisMonth: number;
  totalOrderToday: number;
  totalIncome: number;
  totalIncomeThisMonth: number;
  totalIncomeToday: number;
  monthly: {
    month: string[];
    sales: number[];
  };
  daily: {
    day: string[];
    sales: number[];
  };
}
