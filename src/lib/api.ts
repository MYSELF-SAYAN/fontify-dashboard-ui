
import axios, { AxiosRequestConfig } from "axios";

const API_URL = "https://fontify-server.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fontify-token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      localStorage.setItem("fontify-token", response.data.token);
      localStorage.setItem("fontify-user", JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("fontify-token");
    localStorage.removeItem("fontify-user");
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("fontify-user");
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  isLoggedIn: () => {
    return !!localStorage.getItem("fontify-token");
  },

  isAdmin: () => {
    const userStr = localStorage.getItem("fontify-user");
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    return user.role === "admin";
  },
};

// Upload services
export const uploadService = {
  uploadImage: async (image: File) => {
    try {
      const formData = new FormData();
      formData.append("image", image);
      
      const config: AxiosRequestConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      
      const response = await api.post("/upload/images", formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  uploadFont: async (font: File) => {
    try {
      const formData = new FormData();
      formData.append("font", font);
      
      const config: AxiosRequestConfig = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };
      
      const response = await api.post("/upload/fonts", formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Order services
export const orderService = {
  createOrder: async (imageUrl: string) => {
    try {
      const response = await api.post("/order", { imageUrl });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUserOrders: async (userId: string) => {
    try {
      const response = await api.get(`/order/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getOrderById: async (orderId: string) => {
    try {
      const response = await api.get(`/order/get/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin only
  getAllOrders: async () => {
    try {
      const response = await api.get("/order/admin/");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin only
  updateOrderStatus: async (orderId: string, status: string, fontFileUrl?: string) => {
    try {
      const response = await api.put("/order/admin/status", {
        orderId,
        status,
        fontFileUrl,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
