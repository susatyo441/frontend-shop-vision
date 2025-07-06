import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import CaptureProduct from "./VideoStream";

export default function VideoStreamPage() {
  const [resetKey, setResetKey] = useState(0);

  const handleResetCapture = () => {
    setResetKey((prev) => prev + 1);
  };
  return (
    <div>
      <PageMeta
        title="Deteksi Produk | ShopVision"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Product Detection" />
      <CaptureProduct key={resetKey} onResetRequest={handleResetCapture} />
    </div>
  );
}
