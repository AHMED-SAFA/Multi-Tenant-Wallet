import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const createTenant = (name) =>
  axios.post(`${API_URL}/tenants/`, { name });

export const createWallet = (apiKey, owner_name) =>
  axios.post(
    `${API_URL}/wallets/`,
    { owner_name },
    { headers: { "X-API-Key": apiKey } },
  );

export const deposit = (apiKey, wallet_id, amount, idempotency_key) =>
  axios.post(
    `${API_URL}/deposit/`,
    { wallet_id, amount, idempotency_key },
    { headers: { "X-API-Key": apiKey } },
  );

export const withdraw = (apiKey, wallet_id, amount, idempotency_key) =>
  axios.post(
    `${API_URL}/withdraw/`,
    { wallet_id, amount, idempotency_key },
    { headers: { "X-API-Key": apiKey } },
  );

export const transfer = (
  apiKey,
  from_wallet_id,
  to_wallet_id,
  amount,
  idempotency_key,
) =>
  axios.post(
    `${API_URL}/transfer/`,
    { from_wallet_id, to_wallet_id, amount, idempotency_key },
    { headers: { "X-API-Key": apiKey } },
  );

export const getBalance = (apiKey, wallet_id) =>
  axios.get(`${API_URL}/wallets/${wallet_id}/balance/`, {
    headers: { "X-API-Key": apiKey },
  });

export const getTransactions = (apiKey, wallet_id, page = 1) =>
  axios.get(`${API_URL}/wallets/${wallet_id}/transactions/?page=${page}`, {
    headers: { "X-API-Key": apiKey },
  });

export const downloadStatement = async (apiKey, wallet_id) => {
  const res = await axios.get(`${API_URL}/wallets/${wallet_id}/statement/`, {
    headers: { "X-API-Key": apiKey },
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `statement-${wallet_id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
