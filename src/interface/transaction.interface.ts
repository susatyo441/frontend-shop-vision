export interface ICreateTransaction {
  data: ICreateTransactionAttr[];
}

export interface ICreateTransactionAttr {
  productID: string;
  quantity: number;
}

export interface ITransactionProductAttr {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  category: {
    _id: string;
    name: string;
  };
  totalPrice: number;
  coverPhoto: string;
}

export interface ITransaction {
  _id: string;
  createdAt: string;
  product: ITransactionProductAttr;
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
