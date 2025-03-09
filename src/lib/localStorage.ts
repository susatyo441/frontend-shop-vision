import { IUser } from "../interface/user.interface";

export const getAuthToken = () => localStorage.getItem("token");
export const getStoreID = () => localStorage.getItem("storeID");
export const getUser = (): IUser | null => {
  const userData = localStorage.getItem("user");

  if (!userData) return null; // Jika tidak ada data, kembalikan null

  try {
    return JSON.parse(userData) as IUser;
  } catch (error) {
    console.error("Gagal mengurai data user dari localStorage:", error);
    return null;
  }
};
