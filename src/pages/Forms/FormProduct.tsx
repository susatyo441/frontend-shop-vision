import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import { formatCurrency } from "../../util/formatCurrency";
import ImageUploader, {
  FileWithPreview,
} from "../../components/form/form-elements/ImageInputPreview";
import { getCategory } from "../../service/category.service";
import { ICategoryOptions } from "../../interface/category.interface";
import { IOptions } from "../../interface/common.interface";
import Toast from "../../components/toast/ErrorToast";
import { createProduct } from "../../service/product.service";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router-dom";
import { IToastMessage } from "../../interface/toast.interface";
import { IProductVariant } from "../../interface/product.inteface";

export default function FormProduct() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<(FileWithPreview | null)[]>(
    Array(5).fill(null)
  );
  const [formData, setFormData] = useState({
    name: "",
    stock: 0,
    category: "",
  });
  const [isVariant, setIsVariant] = useState(false);
  const [variants, setVariants] = useState<IProductVariant[]>([
    { name: "", stock: 0, price: 1 },
  ]);
  const [price, setPrice] = useState(0);
  const [categories, setCategory] = useState<ICategoryOptions<IOptions>>({
    data: {
      categoryOptions: [],
    },
  });
  const [toastMessage, setToastMessage] = useState<IToastMessage>({
    type: undefined,
    message: "",
  });

  const handleAddVariant = () => {
    setVariants([...variants, { name: "", stock: 0, price: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(updatedVariants);

    // Kalau variants kosong, matikan isVariant
    if (updatedVariants.length === 0) {
      setIsVariant(false);
    }
  };

  const handleVariantChange = (
    index: number,
    field: keyof (typeof variants)[0],
    value: string | number
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.category ||
      (!isVariant && (!formData.stock || !price))
    ) {
      setToastMessage({
        message: "Harap isi semua field wajib",
        type: "error",
      });
      return;
    }

    // Validasi semua foto sudah terisi
    if (files.some((file) => file === null)) {
      setToastMessage({ message: "Harap isi semua foto", type: "error" });
      return;
    }

    const formPayload = new FormData();
    formPayload.append("name", formData.name);
    formPayload.append("categoryID", formData.category);

    if (isVariant) {
      const hasEmptyField = variants.some(
        (variant) =>
          !variant.name ||
          variant.name === "" ||
          !variant.stock ||
          !variant.price
      );

      if (hasEmptyField) {
        setToastMessage({
          message: "Harap isi semua field varians",
          type: "error",
        });
        return; // Langsung hentikan
      }
      variants.forEach((variant, index) => {
        formPayload.append(`variants[${index}][name]`, variant.name);
        formPayload.append(
          `variants[${index}][stock]`,
          variant.stock.toString()
        );
        formPayload.append(
          `variants[${index}][price]`,
          variant.price.toString()
        );
      });
    } else {
      formPayload.append("stock", formData.stock.toString());
      formPayload.append("price", price.toString());
    }

    files.forEach((file, index) => {
      if (!file) return;
      if (file.file instanceof File) {
        formPayload.append(`image${index + 1}`, file.file);
      }

      if (file.isCover) {
        formPayload.append("coverPhoto", (index + 1).toString());
      }
    });

    try {
      await createProduct(formPayload);
      setToastMessage({
        message: "Berhasil menyimpan produk",
        type: "success",
      });
      setFormData({ name: "", stock: 0, category: "" });
      setPrice(0);
      setFiles(Array(5).fill(null));
      setVariants([{ name: "", stock: 0, price: 0 }]);
      setIsVariant(false);
      navigate("/produk");
    } catch {
      setToastMessage({ message: "Gagal menyimpan produk", type: "error" });
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategory();
        setCategory(data);
        setToastMessage({ message: "", type: undefined });
      } catch {
        setToastMessage({
          message: "Gagal mengambil data produk.",
          type: "error",
        });
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchCategories();
    }, 300); // Debounce 300ms
    return () => clearTimeout(debounceTimer);
  }, []);

  return (
    <div>
      <PageMeta
        title="React.js Form Elements Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Form Product" />
      <ComponentCard title="Isi Data Produk">
        {toastMessage.message != "" && (
          <>
            {console.log("Toast Message:", toastMessage)}
            <Toast
              message={toastMessage.message}
              type={toastMessage.type} // Pastikan type diberikan
              onClose={() => setToastMessage({ type: undefined, message: "" })}
            />
          </>
        )}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Nama Produk</Label>
              <Input
                type="text"
                id="name"
                hint="Wajib diisi"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Kategori</Label>
              <Select
                options={categories.data.categoryOptions}
                placeholder="Pilih Kategori"
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
                className="dark:bg-dark-900"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isVariant}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsVariant(checked);

                  if (checked && variants.length === 0) {
                    setVariants([{ name: "", stock: 0, price: 1 }]);
                  }
                }}
              />
              <Label>Punya Variasi?</Label>
            </div>

            {!isVariant && (
              <>
                <div>
                  <Label>Stok</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Harga</Label>
                  <div className="relative h-11">
                    <Input
                      type="text"
                      className="pl-[62px] h-full"
                      value={formatCurrency(price)}
                      onChange={(e) =>
                        setPrice(Number(e.target.value.replace(/[^0-9]/g, "")))
                      }
                    />
                    <span className="absolute left-0 top-0 h-full w-[46px] flex items-center justify-center border-r border-gray-200 dark:border-gray-800">
                      Rp
                    </span>
                  </div>
                </div>
              </>
            )}

            {isVariant && (
              <div className="space-y-4">
                {variants.map((variant, index) => (
                  <div
                    key={index}
                    className="border p-3 rounded space-y-2 relative bg-gray-50 dark:bg-gray-800"
                  >
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-800 font-bold text-xl"
                      onClick={() => handleRemoveVariant(index)}
                    >
                      ✕
                    </button>

                    <div>
                      <Label>Nama Variasi</Label>
                      <Input
                        value={variant.name}
                        onChange={(e) =>
                          handleVariantChange(index, "name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Stok</Label>
                      <Input
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "stock",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>

                    <div className="relative h-11">
                      <Input
                        type="text"
                        className="pl-[62px] h-full"
                        value={formatCurrency(variant.price)}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "price",
                            Number(e.target.value.replace(/[^0-9]/g, ""))
                          )
                        }
                      />
                      <span className="absolute left-0 top-0 h-full w-[46px] flex items-center justify-center border-r border-gray-200 dark:border-gray-800">
                        Rp
                      </span>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-blue-600 font-medium"
                  onClick={handleAddVariant}
                >
                  + Tambah Variasi
                </button>
              </div>
            )}
            <ImageUploader files={files} onFileChange={setFiles} />
            <div className="mt-8 flex justify-end">
              <Button variant="primary">Simpan Produk</Button>
            </div>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
}
