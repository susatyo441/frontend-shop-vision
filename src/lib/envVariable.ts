import { getStoreID } from "./localStorage";

export const API_URL = import.meta.env.VITE_API_URL;
export const IMAGE_URL = `${import.meta.env.VITE_URL_IMAGE}/${getStoreID()}`;
export const ML_URL = import.meta.env.VITE_ML_URL;
