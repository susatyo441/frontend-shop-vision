import { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Select from "react-select";
import { formatCurrency } from "../../util/formatCurrency";
import ImageUploader, {
  FileWithPreview,
} from "../../components/form/form-elements/ImageInputPreview";
import { getCategory } from "../../service/category.service";
import { IOptions } from "../../interface/common.interface";
import Toast from "../../components/toast/ErrorToast";
import { getProductDetail, updateProduct } from "../../service/product.service";
import Button from "../../components/ui/button/Button";
import { useNavigate, useParams } from "react-router-dom";
import { IToastMessage } from "../../interface/toast.interface";
import { IMAGE_URL } from "../../lib/envVariable";
import {
  IProductPhoto,
  IProductVariant,
} from "../../interface/product.inteface";

export default function FormProductUpdate() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const [variants, setVariants] = useState<IProductVariant[]>([]);
  const [isVariant, setIsVariant] = useState(false);
  const [files, setFiles] = useState<(FileWithPreview | null)[]>(
    Array(5).fill(null)
  );
  const [formData, setFormData] = useState({
    name: "",
    stock: 0,
    category: "",
  });
  const [categories, setCategories] = useState<IOptions[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<IOptions | null>(
    null
  );
  const [price, setPrice] = useState<number>(0);

  const [toastMessage, setToastMessage] = useState<IToastMessage>({
    type: undefined,
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.some((file) => file === null)) {
      setToastMessage({
        message: "Harap upload semua 5 gambar.",
        type: "error",
      });
      return;
    }

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

    const formPayload = new FormData();

    // Data utama
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

    // Append gambar hanya jika ada file baru yang di-upload (cek instance File)
    files.forEach((file, index) => {
      if (!file) return;

      // Jika file diubah (yaitu merupakan instance File), baru di-append
      if (file.file instanceof File) {
        formPayload.append(`image${index + 1}`, file.file);
      }
      // Tetap kirim informasi cover jika gambar di index ini adalah cover
      if (file.isCover) {
        formPayload.append("coverPhoto", (index + 1).toString());
      }
    });

    try {
      await updateProduct(productId!, formPayload);
      setToastMessage({
        message: "Berhasil memperbarui produk",
        type: "success",
      });
      navigate("/produk");
    } catch {
      setToastMessage({ message: "Gagal memperbarui produk", type: "error" });
    }
  };

  const handleAddVariant = () => {
    setVariants([...variants, { name: "", stock: 0, price: 0 }]);
  };

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const categories = await getCategory();
        const categoryOptions = categories.data.categoryOptions.map(
          (cat: IOptions) => ({
            label: cat.label,
            value: cat.value,
          })
        );
        setCategories(categoryOptions);
        const { data } = await getProductDetail(productId!);

        setFormData({
          name: data.name,
          stock: data.stock,
          category: data.category._id,
        });
        setPrice(data.price);

        const matchedCategory =
          categoryOptions.find(
            (cat: IOptions) => cat.value === data.category._id
          ) || null;
        setSelectedCategory(matchedCategory);

        // Buat array 5 slot untuk gambar, isi dengan data gambar yang sudah ada jika ada
        const initialFiles: (FileWithPreview | null)[] = Array(5).fill(null);
        data.photos
          ?.slice(0, 5)
          .forEach((photo: IProductPhoto, index: number) => {
            initialFiles[index] = {
              file: null,
              preview: `${IMAGE_URL}${photo.photo}`,
              isCover: photo.photo === data.coverPhoto,
            };
          });
        setFiles(initialFiles);
        if (data.variants && data.variants.length > 0) {
          setIsVariant(true);
          setVariants(
            data.variants.map((variant: IProductVariant) => ({
              name: variant.name,
              stock: variant.stock,
              price: variant.price,
            }))
          );
        } else {
          setIsVariant(false);
        }
      } catch {
        setToastMessage({
          message: "Gagal mengambil detail produk.",
          type: "error",
        });
      }
    };

    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  const handleVariantChange = (
    index: number,
    field: keyof (typeof variants)[0],
    value: string | number
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleRemoveVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);
    setVariants(updatedVariants);

    // Kalau variants kosong, matikan isVariant
    if (updatedVariants.length === 0) {
      setIsVariant(false);
    }
  };

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
                options={categories}
                placeholder="Pilih Kategori"
                value={selectedCategory}
                onChange={(option) => {
                  setSelectedCategory(option);
                  setFormData((prev) => ({
                    ...prev,
                    category: option?.value ?? "",
                  }));
                }}
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
