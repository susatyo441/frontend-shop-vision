import axios from "axios";
import { getAuthToken } from "../lib/localStorage";
import { API_URL } from "../lib/envVariable";
import { IQuestionerSummary, ITester } from "../interface/questioner.interface";

export const createQuestioner = async (form: FormData) => {
  try {
    await axios.post(`${API_URL}/questioner`, form, {
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
    console.error("Gagal create questioner:", error);
    throw error;
  }
};

export const getQuestionerSummary = async (): Promise<IQuestionerSummary> => {
  try {
    const response = await axios.get(`${API_URL}/questioner`, {
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

export const getQuestionerDetail = async (
  questionerId: string
): Promise<IQuestionerSummary> => {
  try {
    const response = await axios.get(`${API_URL}/questioner/${questionerId}`, {
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

export const getCreditList = async (): Promise<ITester[]> => {
  try {
    const response = await axios.get(`${API_URL}/questioner/credits`, {
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
    console.error("Gagal get credit:", error);
    throw error; // Tetap lempar error agar caller tahu
  }
};
