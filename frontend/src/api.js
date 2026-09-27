import axios from "axios";

const API_URL = "http://localhost:8000/api";

const client = axios.create({ baseURL: API_URL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = (data) => client.post("/auth/register/", data);
export const login = (email, password) =>
  client.post("/auth/login/", { email, password });
export const logout = (refresh) => client.post("/auth/logout/", { refresh });
export const getMe = () => client.get("/tenants/me/");

export const createWallet = (owner_name) =>
  client.post("/wallets/create/", { owner_name });
export const listWallets = () => client.get("/wallets/");

export const deposit = (wallet_id, amount, idempotency_key) =>
  client.post("/deposit/", { wallet_id, amount, idempotency_key });
export const withdraw = (wallet_id, amount, idempotency_key) =>
  client.post("/withdraw/", { wallet_id, amount, idempotency_key });
export const transfer = (
  from_wallet_id,
  to_wallet_id,
  amount,
  idempotency_key,
) =>
  client.post("/transfer/", {
    from_wallet_id,
    to_wallet_id,
    amount,
    idempotency_key,
  });
export const getBalance = (wallet_id) =>
  client.get(`/wallets/${wallet_id}/balance/`);
export const getTransactions = (wallet_id, page = 1) =>
  client.get(`/wallets/${wallet_id}/transactions/?page=${page}`);
export const getProfile = () => client.get("/auth/me/");
export const downloadStatement = async (wallet_id, days) => {
  const res = await client.get(
    `/wallets/${wallet_id}/statement/?days=${days}`,
    { responseType: "blob" },
  );
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `statement-${wallet_id}-${days}d.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const formatCurrency = (val) => {
  const num = Number(val);
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export const shortenId = (id, chars = 6) => {
  if (!id || typeof id !== "string") return "";
  if (id.length <= chars * 2 + 3) return id;
  return `${id.slice(0, chars)}...${id.slice(-chars)}`;
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch (_) {
    return dateString;
  }
};

export const parseApiError = (err) => {
  if (!err) return "An unexpected error occurred.";
  if (err.response?.data) {
    const data = err.response.data;
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (data.error) return data.error;
    // If it's an object with field errors (e.g. { amount: ["This field is required."] })
    const keys = Object.keys(data);
    if (keys.length > 0) {
      const messages = keys.map((key) => {
        const val = data[key];
        return `${key}: ${Array.isArray(val) ? val.join(" ") : String(val)}`;
      });
      return messages.join(" | ");
    }
    return JSON.stringify(data);
  }
  return err.message || "Network error. Please try again.";
};

