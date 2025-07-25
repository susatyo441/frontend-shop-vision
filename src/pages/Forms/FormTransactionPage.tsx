import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import TransactionForm from "../../components/form/FormTransaction";

export default function TransactionFormPage() {
  return (
    <div>
      <PageMeta
        title="Transaksi Baru | ShopVision"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Transaksi Baru" />
      <TransactionForm defaultSelectedProducts={[]} />
    </div>
  );
}
