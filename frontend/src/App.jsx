import { useState } from "react";
import {
  createTenant,
  createWallet,
  deposit,
  withdraw,
  transfer,
  getBalance,
  getTransactions,
  downloadStatement,
} from "./api";

export default function App() {
  const [tenant, setTenant] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [log, setLog] = useState("");

  const show = (res) => setLog(JSON.stringify(res.data, null, 2));
  const showErr = (err) =>
    setLog(JSON.stringify(err.response?.data ?? err.message, null, 2));

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      const res = await createTenant(e.target.name.value);
      setTenant(res.data);
      show(res);
    } catch (err) {
      showErr(err);
    }
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    try {
      const res = await createWallet(tenant.api_key, e.target.owner.value);
      setWallet(res.data);
      show(res);
    } catch (err) {
      showErr(err);
    }
  };

  const handleDownloadStatement = () => {
    const choice = window.prompt(
      "Download statement for which period?\n1 = Last 1 day\n2 = Last 6 days\n3 = Last 12 days",
      "1",
    );
    const daysMap = { 1: 1, 2: 6, 3: 12 };
    const days = daysMap[choice];
    if (!days) return; // cancelled or invalid input
    downloadStatement(tenant.api_key, wallet.id, days);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      const res = await deposit(
        tenant.api_key,
        wallet.id,
        e.target.amount.value,
        crypto.randomUUID(),
      );
      show(res);
    } catch (err) {
      showErr(err);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      const res = await withdraw(
        tenant.api_key,
        wallet.id,
        e.target.amount.value,
        crypto.randomUUID(),
      );
      show(res);
    } catch (err) {
      showErr(err);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      const res = await transfer(
        tenant.api_key,
        wallet.id,
        e.target.to_wallet_id.value,
        e.target.amount.value,
        crypto.randomUUID(),
      );
      show(res);
    } catch (err) {
      showErr(err);
    }
  };

  const handleBalance = async () => {
    try {
      const res = await getBalance(tenant.api_key, wallet.id);
      show(res);
    } catch (err) {
      showErr(err);
    }
  };

  const handleHistory = async () => {
    try {
      const res = await getTransactions(tenant.api_key, wallet.id);
      show(res);
    } catch (err) {
      showErr(err);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h3>1. Create Tenant</h3>
      <form onSubmit={handleCreateTenant}>
        <input name="name" placeholder="Tenant name" required />
        <button type="submit">Create Tenant</button>
      </form>
      {tenant && (
        <p>
          Tenant: {tenant.name} | API Key: {tenant.api_key}
        </p>
      )}

      {tenant && (
        <>
          <h3>2. Create Wallet</h3>
          <form onSubmit={handleCreateWallet}>
            <input name="owner" placeholder="Wallet owner" required />
            <button type="submit">Create Wallet</button>
          </form>
        </>
      )}
      {wallet && (
        <p>
          Wallet: {wallet.owner_name} | ID: {wallet.id}
        </p>
      )}

      {wallet && (
        <>
          <h3>3. Deposit</h3>
          <form onSubmit={handleDeposit}>
            <input
              name="amount"
              type="number"
              step="0.01"
              placeholder="Amount"
              required
            />
            <button type="submit">Deposit</button>
          </form>

          <h3>4. Withdraw</h3>
          <form onSubmit={handleWithdraw}>
            <input
              name="amount"
              type="number"
              step="0.01"
              placeholder="Amount"
              required
            />
            <button type="submit">Withdraw</button>
          </form>

          <h3>5. Transfer</h3>
          <form onSubmit={handleTransfer}>
            <input
              name="to_wallet_id"
              placeholder="Destination wallet ID"
              required
            />
            <input
              name="amount"
              type="number"
              step="0.01"
              placeholder="Amount"
              required
            />
            <button type="submit">Transfer</button>
          </form>

          <h3>6. Balance / History</h3>
          <button onClick={handleBalance}>Get Balance</button>
          <button onClick={handleHistory}>Get Transaction History</button>
          <button onClick={handleDownloadStatement}>
            Download PDF Statement
          </button>
        </>
      )}

      <h3>Response</h3>
      <pre style={{ background: "#eee", padding: 10 }}>{log}</pre>
    </div>
  );
}
