import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { IPagination } from "../../interface/common.interface";
import { ITransaction } from "../../interface/transaction.interface";
import { useCallback, useEffect, useState } from "react";
import { getTransactions } from "../../service/transaction.service";
import { IToastMessage } from "../../interface/toast.interface";
import Toast from "../toast/ErrorToast";
import { IMAGE_URL } from "../../lib/envVariable";
import { Link } from "react-router";

export default function RecentOrders() {
  const [transactions, setTransactions] = useState<IPagination<ITransaction>>({
    totalRecords: 0,
    data: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;

  const [toastMessage, setToastMessage] = useState<IToastMessage>({
    type: undefined,
    message: "",
  });

  const totalRecords = transactions.totalRecords;
  const totalPages = Math.ceil(totalRecords / limit);
  const startEntry = (currentPage - 1) * limit + 1;
  const endEntry = Math.min(currentPage * limit, totalRecords);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await getTransactions(currentPage, limit, searchQuery);
      setTransactions(data?.data);
      setToastMessage({ type: undefined, message: "" });
    } catch {
      setToastMessage({
        message: "Gagal mengambil data transaction.",
        type: "error",
      });
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [fetchTransactions]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama saat searching
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      {toastMessage.message != "" && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage({ type: undefined, message: "" })}
        />
      )}

      {/* Header & Actions */}
      <div className="flex flex-col gap-2">
        <h1>Transaksi Terbaru</h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          {/* Search di atas (mobile) */}
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
          />
          {/* Tombol Tambah Produk */}
          <Link
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs sm:text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            to={"/transactions/create"}
          >
            + Transaksi Baru
          </Link>
        </div>
      </div>

      {/* Tabel */}
      <div className="max-w-full overflow-x-auto">
        <Table className="table-fixed w-full text-xs sm:text-sm">
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow className="whitespace-nowrap">
              <TableCell className="w-[45%] sm:w-[40%] py-2 sm:py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                Produk
              </TableCell>
              <TableCell className="w-[20%] py-2 sm:py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                Harga
              </TableCell>
              <TableCell className="w-[15%] py-2 sm:py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                Jumlah
              </TableCell>
              <TableCell className="w-[20%] py-2 sm:py-3 font-medium text-gray-500 text-start dark:text-gray-400">
                Total Harga
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {transactions.data.map((transaction) => (
              <TableRow key={`${transaction._id}${transaction.product.name}`}>
                <TableCell className="w-[45%] sm:w-[40%] py-2 sm:py-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-md flex-shrink-0">
                      <img
                        src={`${IMAGE_URL}${transaction.product.coverPhoto}`}
                        alt={transaction.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-800 dark:text-white/90">
                        {transaction.product.name}
                      </p>
                      <span className="block text-gray-500 dark:text-gray-400 truncate">
                        {transaction.product.category.name}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="w-[20%] py-2 sm:py-3 text-gray-500 dark:text-gray-400">
                  {`Rp ${transaction.product.price.toLocaleString()}`}
                </TableCell>
                <TableCell className="w-[15%] py-2 sm:py-3 text-gray-500 dark:text-gray-400">
                  {transaction.product.quantity}
                </TableCell>
                <TableCell className="w-[20%] py-2 sm:py-3 text-gray-500 dark:text-gray-400">
                  {`Rp ${transaction.product.totalPrice.toLocaleString()}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 mt-4 sm:flex-row">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Menampilkan {startEntry}–{endEntry} dari {totalRecords} transaksi
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Sebelumnya
          </button>

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
            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-500 transition hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
}
