import axios from "axios";
import { API_URL } from "../lib/envVariable";

export const loginUser = async (data: { email: string; password: string }) => {
  try {
    const response = await axios.post(`${API_URL}/user/login`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Pastikan data ada di response
    if (response.data?.data) {
      const { token, user } = response.data.data;

      // Simpan ke localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("storeID", user.storeId);
      localStorage.setItem("user", JSON.stringify(user));
    }

    return response.data;
  } catch (error: unknown) {
    console.error("Gagal login:", error);
    throw error;
  }
};
