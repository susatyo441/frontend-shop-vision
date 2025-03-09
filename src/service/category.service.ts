import axios from "axios";
import { API_URL } from "../lib/envVariable";
import { getAuthToken } from "../lib/localStorage";

export const getCategory = async () => {
  try {
    const response = await axios.get(`${API_URL}/category`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response.data; // Sesuaikan dengan struktur API
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("token"); // Hapus token
      window.location.href = "/signin"; // Redirect ke Signin
    }
    console.error("Gagal mengambil data category:", error);
    throw error; // Bisa ditangani di komponen pemanggil
  }
};
