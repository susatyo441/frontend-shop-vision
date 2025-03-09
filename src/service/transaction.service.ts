import axios from "axios";
import { getAuthToken } from "../lib/localStorage";
import { API_URL } from "../lib/envVariable";
import { ICreateTransaction } from "../interface/transaction.interface";

export const createTransaction = async (data: ICreateTransaction) => {
  try {
    await axios.post(`${API_URL}/transaction`, data, {
      // Kirim langsung data JSON
      headers: {
        "Content-Type": "application/json", // Ubah ke application/json
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token"); // Hapus token
      window.location.href = "/signin"; // Redirect ke Signin
    }
    console.error("Gagal create transaction:", error);
    throw error;
  }
};

export const getTransactions = async (
  page: number,
  limit: number,
  search: string
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sortBy: "createdAt",
      sortOrder: "-1",
    });

    const response = await axios.get(
      `${API_URL}/transaction?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token"); // Hapus token
      window.location.href = "/signin"; // Redirect ke Signin
    }
    console.error("Gagal mengambil data produk:", error);
    throw error; // Bisa ditangani di komponen pemanggil
  }
};

export const getTransactionSummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/transaction/summary`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token"); // Hapus token
      window.location.href = "/signin"; // Redirect ke Signin
    }
    console.error("Gagal mengambil data produk:", error);
    throw error; // Bisa ditangani di komponen pemanggil
  }
};
