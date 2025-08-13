import {
  CurrencyRupeeIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { ITransactionSummary } from "../../interface/transaction.interface";
import { formatCurrencyKoin } from "../../util/formatCurrency";

interface Props {
  summary: ITransactionSummary;
}

export default function EcommerceMetrics({ summary }: Props) {
 

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
      {/* Total Order */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <ShoppingCartIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="mt-5 space-y-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Order
          </span>
          <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
            {summary.totalOrder.toLocaleString()}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Bulan Ini: {summary.totalOrderThisMonth.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Hari Ini: {summary.totalOrderToday.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Total Income */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <CurrencyRupeeIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="mt-5 space-y-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Pendapatan
          </span>
          <h4 className="font-bold text-gray-800 text-title-sm dark:text-white/90">
            {formatCurrencyKoin(summary.totalIncome)}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Bulan Ini: {formatCurrencyKoin(summary.totalIncomeThisMonth)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Hari Ini: {formatCurrencyKoin(summary.totalIncomeToday)}
          </p>
        </div>
      </div>
    </div>
  );
}
