import React, { useState, useEffect } from "react";
import Select from "react-select"; // Kita pakai react-select agar multi-select lebih fleksibel
import { getProducts } from "../../service/product.service";
import { IToastMessage } from "../../interface/toast.interface";
import Toast from "../../components/toast/ErrorToast";
import { createTransaction } from "../../service/transaction.service";
import { ICreateTransaction } from "../../interface/transaction.interface";
import ComponentCard from "../../components/common/ComponentCard";
import { useNavigate } from "react-router";
import LoadingToast from "../../components/loading/ToastLoading";

interface Product {
  _id: string;
  name: string;
  price?: number | null;
  stock?: number | null;
  variants?: Variant[];
}

interface Variant {
  name: string;
  price: number;
  stock: number;
}
interface Option {
  value: string; // productID atau productID|variantName
  label: string;
  price: number;
  stock: number;
  productID: string; // productID asli
  variantName: string | null; // null kalau tidak pakai variant
}

interface SelectedProduct {
  _id: string; // productID atau productID|variantName (untuk input tracking)
  productID: string;
  name: string;
  price: number;
  stock: number;
  variantName: string | null;
  quantity: number;
  subtotal: number;
}

export default function TransactionForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Option[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});

  const [toastMessage, setToastMessage] = useState<IToastMessage>({
    type: undefined,
    message: "",
  });
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(search);
    }, 300); // debounce 300ms

    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = async (searchValue: string) => {
    try {
      const { data } = await getProducts(1, 10000, searchValue, "name", true);
      setProducts(
        data.data.flatMap((product: Product) => {
          if (product.variants && product.variants.length > 0) {
            return product.variants.map((variant) => ({
              value: `${product._id}|${variant.name}`, // Gabung productID|variantName
              label: `${product.name} - ${variant.name} (Stok: ${variant.stock})`,
              price: variant.price,
              stock: variant.stock,
              productID: product._id,
              variantName: variant.name,
            }));
          } else {
            return {
              value: product._id,
              label: `${product.name} (Stok: ${product.stock ?? 0})`,
              price: product.price ?? 0,
              stock: product.stock ?? 0,
              productID: product._id,
              variantName: null,
            };
          }
        })
      );
    } catch {
      setToastMessage({
        message: "Gagal mengambil data produk.",
        type: "error",
      });
    }
  };

  const handleProductSelect = (selectedOptions: Option[]) => {
    const selected = selectedOptions.map((option) => {
      const existingProduct = selectedProducts.find(
        (p) => p._id === option.value
      );
      const quantity = existingProduct?.quantity || 1;

      return {
        _id: option.value, // tetap pakai value untuk tracking di inputValue
        productID: option.productID,
        name: option.label,
        price: option.price,
        stock: option.stock,
        variantName: option.variantName,
        quantity,
        subtotal: quantity * option.price,
      };
    });

    const initialInputValues = Object.fromEntries(
      selected.map((p) => [p._id, p.quantity.toString()])
    );

    setSelectedProducts(selected);
    setInputValues(initialInputValues);
  };

  const handleInputChange = (productId: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleQuantityBlur = (productId: string) => {
    const rawValue = inputValues[productId] ?? "1";
    let quantity = parseInt(rawValue, 10) || 1;

    const product = selectedProducts.find((p) => p._id === productId);
    if (!product) return;

    if (quantity < 1) quantity = 1;
    if (quantity > product.stock) quantity = product.stock;

    setSelectedProducts((prev) =>
      prev.map((p) =>
        p._id === productId
          ? {
              ...p,
              quantity,
              subtotal: quantity * p.price,
            }
          : p
      )
    );

    setInputValues((prev) => ({
      ...prev,
      [productId]: quantity.toString(),
    }));
  };

  const totalAmount = selectedProducts.reduce(
    (sum, product) => sum + product.subtotal,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (selectedProducts.length === 0) {
      setIsLoading(false);
      setToastMessage({
        message: "Pilih setidaknya satu produk!",
        type: "error",
      });
      return;
    }

    const payload: ICreateTransaction = {
      data: selectedProducts.map((p) => ({
        productID: p.productID,
        quantity: p.quantity,
        variantName: p.variantName, // kirim jika ada
      })),
    };

    try {
      await createTransaction(payload);
      setToastMessage({
        message: "Transaksi berhasil disimpan!",
        type: "success",
      });
      setSelectedProducts([]); // Reset form
      navigate("/");
    } catch {
      setIsLoading(false);
      setToastMessage({
        message: "Gagal menyimpan transaksi.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ComponentCard title="Transaksi Baru">
      <LoadingToast message="Menyimpan transaksi..." isLoading={isLoading} />
      <div className="p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Input Transaksi</h1>

        {toastMessage.message != "" && (
          <Toast
            message={toastMessage.message}
            type={toastMessage.type}
            onClose={() => setToastMessage({ type: undefined, message: "" })}
          />
        )}

        <div className="mb-4">
          <label className="block font-medium mb-2">Pilih Produk</label>
          <Select
            options={products}
            isMulti
            placeholder="Cari produk..."
            onInputChange={(value) => setSearch(value)}
            onChange={(options) => handleProductSelect(options as Option[])}
            getOptionValue={(option) => option.value}
          />
        </div>

        {/* Tabel Produk Terpilih */}
        {selectedProducts.length > 0 && (
          <div className="mb-4">
            <h2 className="font-medium mb-2">Produk Terpilih</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm min-w-[500px]">
                <thead className="bg-gray-100">
                  <tr className="whitespace-nowrap">
                    <th className="border border-gray-300 px-2 py-1 sm:px-3 sm:py-2 text-left">
                      Nama Produk
                    </th>
                    <th className="border border-gray-300 px-2 py-1 sm:px-3 sm:py-2">
                      Harga Satuan
                    </th>
                    <th className="border border-gray-300 px-2 py-1 sm:px-3 sm:py-2">
                      Jumlah
                    </th>
                    <th className="border border-gray-300 px-2 py-1 sm:px-3 sm:py-2">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((product) => (
                    <tr key={product._id} className="whitespace-nowrap">
                      <td className="border border-gray-300 px-2 py-1 sm:px-3 sm:py-2">
                        {product.name}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 sm:px-3 sm:py-2">
                        Rp {product.price.toLocaleString()}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 sm:px-3 sm:py-2">
                        <input
                          type="number"
                          inputMode="numeric"
                          className="w-12 sm:w-16 border rounded p-0.5 text-center"
                          min={1}
                          max={product.stock}
                          value={inputValues[product._id] ?? ""}
                          onChange={(e) =>
                            handleInputChange(product._id, e.target.value)
                          }
                          onBlur={() => handleQuantityBlur(product._id)}
                        />
                      </td>
                      <td className="border border-gray-300 px-2 py-1 sm:px-3 sm:py-2">
                        Rp {product.subtotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Total Harga */}
        <div className="flex justify-end items-center gap-4 text-lg font-semibold">
          <span>Total:</span>
          <span className="text-blue-600">
            Rp {totalAmount.toLocaleString()}
          </span>
        </div>

        {/* Tombol Simpan */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </div>
      </div>
    </ComponentCard>
  );
}
