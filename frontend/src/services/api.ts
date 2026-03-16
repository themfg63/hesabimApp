import axios from "axios";

// İstemci tarafında her zaman Next.js API route'larına git (same-origin).
// Böylece telefonda localhost problemi yaşanmaz.
const getBaseURL = () => "/api";

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

export default api;