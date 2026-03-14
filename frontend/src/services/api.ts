import axios from "axios";

// Mobil cihazlardan erişim için dinamik baseURL
const getBaseURL = () => {
  // Production ortamı için
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log("Using API URL from env:", process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Development için - bilgisayarınızın IP adresini buraya yazın
  console.log("Using default localhost API URL");
  return "http://localhost:8080/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 10000, // 10 saniye timeout
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
    const response = await api.post("/register", {
      name,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
};

export default api;