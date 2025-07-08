import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import RecentOrders from "../../components/ecommerce/RecentOrders";

export default function TransactionPage() {
  return (
    <>
      <PageMeta
        title="Transaksi | ShopVision"
        description="This is React.js Basic Tables Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Transaksi" />
      <div className="space-y-6">
        <RecentOrders />
      </div>
    </>
  );
}
