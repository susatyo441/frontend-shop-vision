import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

// import Badge from "../../ui/badge/Badge";
import { IProduct } from "../../interface/product.inteface";
import { useCallback, useEffect, useState } from "react";
import { getProducts } from "../../service/product.service";
import Toast from "../toast/ErrorToast";
import { IPagination } from "../../interface/common.interface";
import { Link, useNavigate } from "react-router";
import { IToastMessage } from "../../interface/toast.interface";
import { IMAGE_URL } from "../../lib/envVariable";

export default function ProductTable() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<IPagination<IProduct>>({
    totalRecords: 0,
    data: [],
  });
  const limit = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<IToastMessage>({
    type: undefined,
    message: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Hitung nilai-nilai derivatif dari state yang ada
  const totalRecords = products.totalRecords;
  const totalPages = Math.ceil(totalRecords / limit);
  const startEntry = (currentPage - 1) * limit + 1;
  const endEntry = Math.min(currentPage * limit, totalRecords);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await getProducts(currentPage, limit, searchQuery);
      setProducts(data?.data);
      setToastMessage({
        type: undefined,
        message: "",
      });
    } catch {
      setToastMessage({
        message: "Gagal mengambil data produk.",
        type: "error",
      });
    }
  }, [currentPage, searchQuery, limit]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchProducts]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama saat mencari
  };

  // Handler untuk ganti halaman
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  function formatRange(min: number, max: number) {
    if (min === max) return `${min}`;
    return `${min} - ${max}`;
  }

  function formatRangePrice(min: number, max: number) {
    if (min === max) return `${min}`;
    return `Rp${min.toLocaleString()} - Rp${max.toLocaleString()}`;
  }

  function getStockRange(product: IProduct) {
    if (!product.variants?.length) {
      return product.stock?.toString() ?? "0";
    }

    const stocks = product.variants.map((v) => v.stock || 0);
    console.log(stocks);
    return formatRange(Math.min(...stocks), Math.max(...stocks));
  }

  function getPriceRange(product: IProduct) {
    if (!product.variants?.length) {
      return `Rp${(product.price ?? 0).toLocaleString()}`;
    }

    const prices = product.variants.map((v) => v.price || 0);
    return formatRangePrice(Math.min(...prices), Math.max(...prices));
  }

  const renderPaginationNumbers = () => {
    const pages = [];
    if (currentPage > 2) pages.push(1, "...");

    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 1) pages.push("...", totalPages);

    return pages;
  };

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        {toastMessage.message != "" && (
          <>
            <Toast
              message={toastMessage.message}
              type={toastMessage.type} // Pastikan type diberikan
              onClose={() => setToastMessage({ type: undefined, message: "" })}
            />
          </>
        )}
       {/* Search dan Tombol Aksi */}
        <div className="flex flex-col-reverse items-center justify-between gap-4 p-4 sm:flex-row">
          {/* Search di bawah saat mobile */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-white/10 dark:bg-white/5 dark:focus:border-blue-500"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
              <path d="M21 21l-6 -6" />
            </svg>
          </div>

          {/* Grup Tombol - di atas saat mobile, berdampingan di desktop */}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
            <Link
              to="/capture/update-stock"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Stok Produk
            </Link>
           <Link
              to="/produk/form"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 sm:w-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Produk
            </Link>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <Table className="table-fixed">
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="w-1/4 px-3 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Produk
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/4 px-3 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    Stok
                  </TableCell>
                  <TableCell
                    isHeader
                    className="w-1/4 px-3 py-3 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
                  >
                    Harga
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {products?.data?.map((order) => (
                  <TableRow
                    onClick={() => navigate(`/produk/form/${order._id}`)}
                    key={order._id}
                    className="cursor-pointer odd:bg-gray-50 dark:odd:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <TableCell className="w-1/4 px-3 py-4 text-start overflow-hidden">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 overflow-hidden rounded-full flex-shrink-0">
                          <img
                            width={28}
                            height={28}
                            src={`${IMAGE_URL}${order.coverPhoto}`}
                            alt={order.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 overflow-hidden">
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90 truncate">
                            {order.name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400 truncate">
                            {order.category.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    {/* Kolom Stok */}
                    <TableCell className="w-1/4 px-3 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                      {getStockRange(order)}
                    </TableCell>

                    {/* Kolom Harga */}
                    <TableCell className="w-1/4 px-3 py-3 text-gray-500 text-theme-sm dark:text-gray-400 text-center">
                      {getPriceRange(order)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Menampilkan {startEntry}–{endEntry} dari {totalRecords} entri
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/10"
            >
              Sebelumnya
            </button>

            {/* Tombol nomor halaman */}
            {renderPaginationNumbers().map((page, idx) =>
              typeof page === "number" ? (
                <button
                  key={idx}
                  onClick={() => handlePageChange(page)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span key={idx} className="text-gray-500 px-1">
                  {page}
                </span>
              )
            )}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/10"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
