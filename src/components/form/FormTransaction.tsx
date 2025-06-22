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

interface TransactionFormProps {
  defaultSelectedProducts?: SelectedProduct[];
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

export interface SelectedProduct {
  _id: string; // productID atau productID|variantName (untuk input tracking)
  productID: string;
  name: string;
  price: number;
  stock: number;
  variantName: string | null;
  quantity: number;
  subtotal: number;
}

export default function TransactionForm({
  defaultSelectedProducts = [],
}: TransactionFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Option[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    defaultSelectedProducts
  );
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>(
    () => {
      // Inisialisasi awal dengan nilai quantity dari product
      const initialValues: { [key: string]: string } = {};
      selectedProducts.forEach((product) => {
        initialValues[product._id] = product.quantity.toString();
      });
      return initialValues;
    }
  );

  const [toastMessage, setToastMessage] = useState<IToastMessage>({
    type: undefined,
    message: "",
  });
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    // Update selectedProducts ketika defaultSelectedProducts berubah
    setSelectedProducts(defaultSelectedProducts);

    // Update inputValues sesuai dengan quantity terbaru
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
  }, [defaultSelectedProducts]);

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
    setSelectedOptions(selectedOptions);
  };

  const handleInputChange = (productId: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [productId]: value,
    }));
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

  // Function to increase quantity
  const increaseQuantity = (productId: string) => {
    const product = selectedProducts.find((p) => p._id === productId);
    if (!product) return;

    const newQuantity = Math.min(product.quantity + 1, product.stock);
    updateProductQuantity(productId, newQuantity);
  };

  // Function to decrease quantity
  const decreaseQuantity = (productId: string) => {
    const product = selectedProducts.find((p) => p._id === productId);
    if (!product) return;

    const newQuantity = Math.max(product.quantity - 1, 1);
    updateProductQuantity(productId, newQuantity);
  };

  // Function to update quantity
  const updateProductQuantity = (productId: string, newQuantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p._id === productId
          ? {
              ...p,
              quantity: newQuantity,
              subtotal: newQuantity * p.price,
            }
          : p
      )
    );

    setInputValues((prev) => ({
      ...prev,
      [productId]: newQuantity.toString(),
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
      <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">Input Transaksi</h1>
          <div className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {toastMessage.message != "" && (
          <Toast
            message={toastMessage.message}
            type={toastMessage.type}
            onClose={() => setToastMessage({ type: undefined, message: "" })}
          />
        )}

        {/* Search and Product Selection */}
        <div className="mb-6">
          <label className="block font-medium mb-2">Cari & Tambah Produk</label>
          <Select
            options={products}
            isMulti
            value={selectedOptions}
            placeholder="Cari produk..."
            onInputChange={(value) => setSearch(value)}
            onChange={(options) => handleProductSelect(options as Option[])}
            getOptionValue={(option) => option.value}
            className="w-full"
          />
        </div>

        {/* Receipt-style Product List */}
        {selectedProducts.length > 0 && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="font-bold text-center mb-4">Daftar Belanja</h2>

            {/* Receipt Header */}
            <div className="grid grid-cols-12 gap-2 mb-3 pb-2 border-b border-gray-300 font-semibold text-sm">
              <div className="col-span-6">Produk</div>
              <div className="col-span-2 text-center">Harga</div>
              <div className="col-span-3 text-center">Jumlah</div>
              <div className="col-span-1"></div>
            </div>

            {/* Product Items */}
            <div className="space-y-4">
              {selectedProducts.map((product) => (
                <div
                  key={product._id}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  {/* Product Name */}
                  <div className="col-span-6">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500">
                      Stok: {product.stock}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-right">
                    <div className="text-sm">
                      Rp {product.price.toLocaleString()}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="col-span-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => decreaseQuantity(product._id)}
                        className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 text-sm font-bold"
                        disabled={product.quantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        className="w-12 border rounded p-1 text-center text-sm"
                        min={1}
                        max={product.stock}
                        value={
                          inputValues[product._id] ||
                          product.quantity.toString()
                        }
                        onChange={(e) =>
                          handleInputChange(product._id, e.target.value)
                        }
                        onBlur={() => handleQuantityBlur(product._id)}
                      />
                      <button
                        onClick={() => increaseQuantity(product._id)}
                        className="w-7 h-7 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 text-sm font-bold"
                        disabled={product.quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeProduct(product._id)}
                      className="text-red-500 hover:text-red-700"
                      title="Hapus produk"
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

                  {/* Subtotal */}
                  <div className="col-span-12 mt-1 pt-1 border-t border-gray-100 flex justify-between">
                    <div className="text-sm">Subtotal:</div>
                    <div className="font-medium text-sm">
                      Rp {product.subtotal.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <div className="mt-4 pt-3 border-t border-gray-300 flex justify-between items-center text-lg font-bold">
              <span>TOTAL:</span>
              <span className="text-blue-600">
                Rp {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition font-medium shadow-md w-full max-w-xs"
            disabled={isLoading || selectedProducts.length === 0}
          >
            {isLoading ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </div>
      </div>
    </ComponentCard>
  );
}
