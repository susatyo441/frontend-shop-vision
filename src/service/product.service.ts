import axios from "axios";
import { getAuthToken } from "../lib/localStorage";
import { API_URL } from "../lib/envVariable";
import { IProduct } from "../interface/product.inteface";

export const getProducts = async (
  page: number,
  limit: number,
  search: string,
  sortBy?: string,
  isAvailable?: boolean
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
    });

    if (sortBy) {
      params.append("sortBy", sortBy);
      params.append("sortOrder", "1");
    }

    if (isAvailable) {
      params.append("isAvailable", isAvailable.toString());
    }

    const response = await axios.get(
      `${API_URL}/product?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    return response.data; // Sesuaikan dengan struktur API
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token"); // Hapus token
      window.location.href = "/signin"; // Redirect ke Signin
    }
    console.error("Gagal mengambil data produk:", error);
    throw error; // Bisa ditangani di komponen pemanggil
  }
};

export const createProduct = async (form: FormData) => {
  try {
    await axios.post(`${API_URL}/product`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token"); // Hapus token
      window.location.href = "/signin"; // Redirect ke Signin
    }
    console.error("Gagal create produk:", error);
    throw error;
  }
};

export const updateProduct = async (id: string, form: FormData) => {
  try {
    await axios.put(`${API_URL}/product/${id}`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token"); // Hapus token
      window.location.href = "/signin"; // Redirect ke Signin
    }
    console.error("Gagal update produk:", error);
    throw error;
  }
};

export const updateProductStocks = async (body: {
  products: { productId: string; stock: number; variant?: string }[];
}) => {
  try {
    await axios.patch(`${API_URL}/product/stock`, body, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token"); // Hapus token
      window.location.href = "/signin"; // Redirect ke Signin
    }
    console.error("Gagal edit produk:", error);
    throw error; // Tetap lempar error agar caller tahu
  }
};

export const deleteProducts = async (ids: string[]) => {
  try {
    await axios.delete(`${API_URL}/product`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      data: { ids }, // <- pakai `data` karena axios `delete` tidak punya body langsung
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token"); // Hapus token
      window.location.href = "/signin"; // Redirect ke Signin
    }
    console.error("Gagal delete produk:", error);
    throw error; // Tetap lempar error agar caller tahu
  }
};

export const getProductDetail = async (id: string): Promise<IProduct> => {
  try {
    const response = await axios.get(`${API_URL}/product/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token"); // Hapus token
      window.location.href = "/signin"; // Redirect ke Signin
    }
    console.error("Gagal get produk:", error);
    throw error; // Tetap lempar error agar caller tahu
  }
};
