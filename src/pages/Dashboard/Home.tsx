import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import SalesChart from "../../components/ecommerce/SalesChart";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";
import { useCallback, useEffect, useState } from "react";
import { getTransactionSummary } from "../../service/transaction.service";
import { ITransactionSummary } from "../../interface/transaction.interface";
import { IToastMessage } from "../../interface/toast.interface";
import Toast from "../../components/toast/ErrorToast";

export default function Home() {
  const [summary, setSummary] = useState<ITransactionSummary>({
    totalIncome: 0,
    totalIncomeThisMonth: 0,
    totalIncomeToday: 0,
    totalOrder: 0,
    totalOrderThisMonth: 0,
    totalOrderToday: 0,
    monthly: {
      month: [],
      sales: [],
    },
    daily: {
      sales: [],
      day: [],
    },
  });

  const [toastMessage, setToastMessage] = useState<IToastMessage>({
    type: undefined,
    message: "",
  });

  const fetchSummary = useCallback(async () => {
    try {
      const { data } = await getTransactionSummary();
      const monthlyCategories = data.monthly.map(
        (item: { month: string }) => item.month
      );
      const monthlySales = data.monthly.map(
        (item: { sales: number }) => item.sales
      );

      const dailyCategories = data.daily.map(
        (item: { day: string }) => item.day
      );
      const dailySales = data.daily.map(
        (item: { sales: number }) => item.sales
      );

      setSummary({
        ...data,
        monthly: {
          month: monthlyCategories,
          sales: monthlySales,
        },
        daily: {
          day: dailyCategories,
          sales: dailySales,
        },
      });

      setToastMessage({
        type: undefined,
        message: "",
      });
    } catch {
      setToastMessage({
        message: "Gagal mengambil data summary.",
        type: "error",
      });
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <>
      <PageMeta
        title="Dashboard ShopVision"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          {toastMessage.message != "" && (
            <>
              {console.log("Toast Message:", toastMessage)}
              <Toast
                message={toastMessage.message}
                type={toastMessage.type}
                onClose={() =>
                  setToastMessage({ type: undefined, message: "" })
                }
              />
            </>
          )}
          <EcommerceMetrics summary={summary} />

          <SalesChart
            categories={summary.monthly.month}
            data={summary.monthly.sales}
            title="Penjualan Bulanan"
          />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <SalesChart
            categories={summary.daily.day}
            data={summary.daily.sales}
            title="Penjualan Harian"
          />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
