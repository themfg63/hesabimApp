import axios from "axios";

import type { Account, CreateAccountPayload } from "@/types/account";
import type {
  CreateIpoPayload,
  CreateIpoPositionPayload,
  IpoHeader,
  IpoPortfolioResponse,
  IpoSummaryItem,
  SellIpoPositionPayload,
} from "@/types/ipo";

// İstemci tarafında her zaman Next.js API route'larına git (same-origin).
// Böylece telefonda localhost problemi yaşanmaz.
const getBaseURL = () => "/api";

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 10000, // 10 saniye timeout
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

console.log("API Base URL:", api.defaults.baseURL);

// Login API fonksiyonu
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post("/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Register API fonksiyonu
export const registerUser = async (name: string, email: string, password: string) => {
  try {
    console.log("Sending register request to:", api.defaults.baseURL + "/register");
    
    // Ad ve soyad ayrımı yap
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const surname = nameParts.slice(1).join(' ') || '';
    
    const response = await api.post("/register", {
      name: firstName,
      surname: surname,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Kullanıcı Kayıt Hatası:", error);
    throw error;
  }
};

export const getAccounts = async () => {
  const response = await api.get<Account[]>("/accounts");
  return response.data;
};

export const createAccount = async (payload: CreateAccountPayload) => {
  const response = await api.post<Account>("/accounts", payload);
  return response.data;
};

export const getIpos = async () => {
  const response = await api.get<IpoSummaryItem[]>("/ipos");
  return response.data;
};

export const getIpoDetail = async (ipoId: number | string) => {
  const response = await api.get<IpoPortfolioResponse>(`/ipos/${ipoId}`);
  return response.data;
};

export const createIpo = async (payload: CreateIpoPayload) => {
  const response = await api.post<IpoHeader>("/ipos", payload);
  return response.data;
};

export const updateIpoPrice = async (ipoId: number | string, currentPrice: number) => {
  const response = await api.patch<IpoHeader>(`/ipos/${ipoId}/price`, { currentPrice });
  return response.data;
};

export const createIpoPosition = async (ipoId: number | string, payload: CreateIpoPositionPayload) => {
  const response = await api.post(`/ipos/${ipoId}/positions`, payload);
  return response.data;
};

export const deleteIpoPosition = async (positionId: number | string) => {
  await api.delete(`/ipos/positions/${positionId}`);
};

export const sellIpoPosition = async (positionId: number | string, payload: SellIpoPositionPayload) => {
  const response = await api.patch(`/ipos/positions/${positionId}/sell`, payload);
  return response.data;
};

export default api;