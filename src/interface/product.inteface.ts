export interface IProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: {
    _id: string;
    name: string;
  };
  coverPhoto: string;
  photos?: IProductPhoto[];
  variants: IProductVariant[];
  quantity?: number; // Optional, only if needed for the product
  subtotal?: number; // Optional, only if needed for the product
}

export interface IProductVariant {
  name: string;
  price: number;
  stock: number;
  capitalPrice?: number;
}

export interface IProductPhoto {
  _id: string;
  key: number;
  photo: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
}
