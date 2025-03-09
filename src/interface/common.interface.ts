export interface IPagination<T> {
  totalRecords: number;
  data: T[];
}

export interface IOptions {
  label: string;
  value: string;
}
