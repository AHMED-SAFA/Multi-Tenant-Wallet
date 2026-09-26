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
