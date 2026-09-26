import { useState, useEffect } from "react";
import {
  createWallet,
  deposit,
  withdraw,
  transfer,
  getBalance,
  getTransactions,
  downloadStatement,
  getMe,
  logout as apiLogout,
} from "./api";
import Auth from "./Auth";

export default function App() {
  const [tenant, setTenant] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [log, setLog] = useState("");

  const show = (res) => setLog(JSON.stringify(res.data, null, 2));
  const showErr = (err) =>
    setLog(JSON.stringify(err.response?.data ?? err.message, null, 2));
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("access_token"),
  );

  const handleLogout = async () => {
    try {
      await apiLogout(localStorage.getItem("refresh_token"));
    } catch (_) {}
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("wallet");
    setTenant(null);
    setWallet(null);
    setLoggedIn(false);
  };

  useEffect(() => {
    if (loggedIn) {
      getMe()
        .then((res) => setTenant(res.data))
        .catch(() => handleLogout());
    }
  }, [loggedIn]);

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    try {
      const res = await createWallet(e.target.owner.value);
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
    downloadStatement(wallet.id, days);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      const res = await deposit(
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
      const res = await getBalance(wallet.id);
      show(res);
    } catch (err) {
      showErr(err);
    }
  };

  const handleHistory = async () => {
    try {
      const res = await getTransactions(wallet.id);
      show(res);
    } catch (err) {
      showErr(err);
    }
  };

  if (!loggedIn) {
    return <Auth onLoggedIn={() => setLoggedIn(true)} />;
  }

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <button onClick={handleLogout} style={{ float: "right" }}>
        Logout
      </button>
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
