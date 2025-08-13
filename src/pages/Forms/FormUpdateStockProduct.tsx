import React, { useState, useEffect } from "react";
import Select from "react-select";
import { getProducts, updateProductStocks } from "../../service/product.service";
import { IToastMessage } from "../../interface/toast.interface";
import Toast from "../../components/toast/ErrorToast";
import { useNavigate } from "react-router";
import LoadingToast from "../../components/loading/ToastLoading";

// Interface tidak berubah
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
  value: string;
  label: string;
  price: number;
  stock: number;
  productID: string;
  variantName: string | null;
}

export interface SelectedProduct {
  _id: string;
  productID: string;
  name: string;
  price: number;
  stock: number; // Stok saat ini (original)
  variantName: string | null;
  quantity: number; // Kita gunakan sebagai 'jumlah stok yang akan ditambahkan'
  subtotal: number;
}

interface StockAdditionFormProps {
  defaultSelectedProducts?: SelectedProduct[];
}

export default function StockAdditionForm({
  defaultSelectedProducts = [],
}: StockAdditionFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    defaultSelectedProducts
  );
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [toastMessage, setToastMessage] = useState<IToastMessage>({
    type: undefined,
    message: "",
  });
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    // Memuat produk awal jika ada
    if (defaultSelectedProducts.length > 0) {
      setSelectedProducts(defaultSelectedProducts);
      const newInputValues = defaultSelectedProducts.reduce((acc, product) => {
        acc[product._id] = product.quantity.toString();
        return acc;
      }, {} as { [key: string]: string });
      setInputValues(newInputValues);
      const initialOptions = defaultSelectedProducts.map((product) => ({
        value: product._id,
        label: product.name,
        price: product.price,
        stock: product.stock,
        productID: product.productID,
        variantName: product.variantName || null,
      }));
      setSelectedOptions(initialOptions);
    }
  }, [defaultSelectedProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = async (searchValue: string) => {
    try {
      const { data } = await getProducts(1, 10000, searchValue, "name", true);
      const productOptions = data.data.flatMap((product: Product) => {
        if (product.variants && product.variants.length > 0) {
          return product.variants.map((variant) => ({
            value: `${product._id}|${variant.name}`,
            label: `${product.name} - ${variant.name}`,
            price: variant.price,
            stock: variant.stock,
            productID: product._id,
            variantName: variant.name,
          }));
        } else {
          return {
            value: product._id,
            label: `${product.name}`,
            price: product.price ?? 0,
            stock: product.stock ?? 0,
            productID: product._id,
            variantName: null,
          };
        }
      });
      setProducts(productOptions);
    } catch {
      setToastMessage({
        message: "Gagal mengambil data produk.",
        type: "error",
      });
    }
  };

  const handleProductSelect = (selected: Option[]) => {
    const newSelectedProducts = selected.map((option) => {
      const existingProduct = selectedProducts.find((p) => p._id === option.value);
      // PENTING: Jika produk baru, jumlah default untuk ditambahkan adalah 1.
      const amountToAdd = existingProduct?.quantity || 1;

      return {
        _id: option.value,
        productID: option.productID,
        name: option.label,
        price: option.price,
        stock: option.stock, // Stok original
        variantName: option.variantName,
        quantity: amountToAdd, // Jumlah yang akan ditambahkan
        subtotal: 0,
      };
    });

    const newInputValues = Object.fromEntries(
      newSelectedProducts.map((p) => [p._id, p.quantity.toString()])
    );

    setSelectedProducts(newSelectedProducts);
    setInputValues(newInputValues);
    setSelectedOptions(selected);
  };

  // Helper function untuk update jumlah stok yang akan ditambahkan
  const updateAmountToAdd = (productId: string, newAmount: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, quantity: newAmount } : p))
    );
    setInputValues((prev) => ({
      ...prev,
      [productId]: newAmount.toString(),
    }));
  };

  const increaseAmount = (productId: string) => {
    const product = selectedProducts.find((p) => p._id === productId);
    if (!product) return;
    updateAmountToAdd(productId, product.quantity + 1);
  };

  const decreaseAmount = (productId: string) => {
    const product = selectedProducts.find((p) => p._id === productId);
    if (!product) return;
    const newAmount = Math.max(1, product.quantity - 1); // Minimum 1
    updateAmountToAdd(productId, newAmount);
  };

  const handleInputChange = (productId: string, value: string) => {
    if (/^\d*$/.test(value)) {
      setInputValues((prev) => ({ ...prev, [productId]: value }));
    }
  };

  const handleAmountInputBlur = (productId: string) => {
    const rawValue = inputValues[productId] ?? "1";
    let amount = parseInt(rawValue, 10);
    if (isNaN(amount) || amount < 1) {
      amount = 1; // Jumlah tambah tidak boleh kurang dari 1
    }
    updateAmountToAdd(productId, amount);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p._id !== productId));
    setSelectedOptions((prev) =>
      prev.filter((option) => option.value !== productId)
    );
    setInputValues((prev) => {
      const newValues = { ...prev };
      delete newValues[productId];
      return newValues;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (selectedProducts.length === 0) {
      setIsLoading(false);
      setToastMessage({
        message: "Pilih setidaknya satu produk untuk ditambah stoknya!",
        type: "error",
      });
      return;
    }

    // PENTING: Kalkulasi payload dengan stok baru
    const payload = selectedProducts.map((p) => ({
      productId: p.productID,
      stock: p.stock + p.quantity, // stok_saat_ini + jumlah_tambah
      variant: p.variantName || undefined,
    }));

    try {
      await updateProductStocks({products:payload});
      setToastMessage({
        message: "Stok produk berhasil ditambahkan!",
        type: "success",
      });
      navigate("/produk");
    } catch {
      setToastMessage({
        message: "Gagal menambahkan stok.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

 return (
    // Gunakan React Fragment karena wrapper sudah disediakan oleh parent
    <>
      <LoadingToast message="Menyimpan perubahan..." isLoading={isLoading} />
      
      {toastMessage.message && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage({ type: undefined, message: "" })}
        />
      )}

      {/* Bagian Select/Search produk tetap ada, namun tanpa wrapper card */}
      <div className="mb-4">
        <label className="block font-medium mb-1 text-sm">
          Cari & Tambah Produk Manual
        </label>
        <Select
          options={products}
          isMulti
          value={selectedOptions}
          placeholder="Ketik untuk mencari produk..."
          onInputChange={(value) => setSearch(value)}
          onChange={(options) => handleProductSelect(options as Option[])}
          getOptionValue={(option) => option.value}
          className="w-full text-sm"
        />
      </div>

      {/* Daftar produk yang akan diupdate */}
      {selectedProducts.length > 0 && (
        <div className="mb-5 bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="font-semibold text-center mb-3 text-base">
            Produk Terdeteksi
          </h2>
          <div className="space-y-4">
            {selectedProducts.map((product) => (
              <div
                key={product._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex-1 mb-3 sm:mb-0">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">
                    Stok saat ini: {product.stock}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <label className="text-xs text-gray-600">Jumlah Tambah:</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => decreaseAmount(product._id)}
                      disabled={product.quantity <= 1}
                      className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-16 border rounded p-1 text-center text-sm"
                      value={inputValues[product._id] || "1"}
                      onChange={(e) => handleInputChange(product._id, e.target.value)}
                      onBlur={() => handleAmountInputBlur(product._id)}
                    />
                    <button
                      onClick={() => increaseAmount(product._id)}
                      className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeProduct(product._id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Hapus dari daftar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tombol submit juga tanpa wrapper card */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleSubmit}
          className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition font-medium shadow-md w-full sm:w-auto text-sm"
          disabled={isLoading || selectedProducts.length === 0}
        >
          {isLoading ? "Menyimpan..." : "Simpan Penambahan Stok"}
        </button>
      </div>
    </>
  );
}