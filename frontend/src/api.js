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
  client.post("/wallets/", { owner_name });
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
