import { useState, useEffect } from "react";
import {
  createWallet,
  listWallets,
  deposit,
  withdraw,
  transfer,
  getBalance,
  getTransactions,
  downloadStatement,
  getMe,
  getProfile,
  logout as apiLogout,
} from "./api";
import Auth from "./Auth";
import Sidebar from "./Sidebar";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("access_token"),
  );
  const [tenant, setTenant] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [txWalletId, setTxWalletId] = useState("");
  const [histWalletId, setHistWalletId] = useState("");
  const [active, setActive] = useState("wallet");
  const [log, setLog] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("dark") === "true",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("dark", darkMode);
  }, [darkMode]);

  const refreshWallets = () => {
    listWallets()
      .then((res) => {
        const data = res.data.results ?? res.data; // handles paginated or plain list
        setWallets(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (loggedIn) {
      getMe()
        .then((res) => setTenant(res.data))
        .catch(() => handleLogout());
      getProfile()
        .then((res) => setProfile(res.data))
        .catch(() => {});
      refreshWallets();
    }
  }, [loggedIn]);

  const show = (res) => setLog(JSON.stringify(res.data, null, 2));
  const showErr = (err) =>
    setLog(JSON.stringify(err.response?.data ?? err.message, null, 2));

  const handleLogout = async () => {
    try {
      await apiLogout(localStorage.getItem("refresh_token"));
    } catch (_) {}
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setTenant(null);
    setProfile(null);
    setWallets([]);
    setLoggedIn(false);
  };

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    try {
      const res = await createWallet(e.target.owner.value);
      show(res);
      e.target.reset();
      refreshWallets();
    } catch (err) {
      showErr(err);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!txWalletId) return setLog("Select a wallet first.");
    try {
      show(
        await deposit(txWalletId, e.target.amount.value, crypto.randomUUID()),
      );
      refreshWallets();
    } catch (err) {
      showErr(err);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!txWalletId) return setLog("Select a wallet first.");
    try {
      show(
        await withdraw(txWalletId, e.target.amount.value, crypto.randomUUID()),
      );
      refreshWallets();
    } catch (err) {
      showErr(err);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!txWalletId) return setLog("Select a source wallet first.");
    try {
      show(
        await transfer(
          txWalletId,
          e.target.to_wallet_id.value,
          e.target.amount.value,
          crypto.randomUUID(),
        ),
      );
      refreshWallets();
    } catch (err) {
      showErr(err);
    }
  };

  const handleBalance = async () => {
    if (!histWalletId) return setLog("Select a wallet first.");
    try {
      show(await getBalance(histWalletId));
    } catch (err) {
      showErr(err);
    }
  };

  const handleHistory = async () => {
    if (!histWalletId) return setLog("Select a wallet first.");
    try {
      show(await getTransactions(histWalletId));
    } catch (err) {
      showErr(err);
    }
  };

  const handleDownloadStatement = () => {
    if (!histWalletId) return setLog("Select a wallet first.");
    const choice = window.prompt(
      "Statement period?\n1 = Last 1 day\n2 = Last 6 days\n3 = Last 12 days",
      "1",
    );
    const daysMap = { 1: 1, 2: 6, 3: 12 };
    const days = daysMap[choice];
    if (!days) return;
    downloadStatement(histWalletId, days);
  };

  if (!loggedIn) return <Auth onLoggedIn={() => setLoggedIn(true)} />;

  const walletSelect = (value, onChange) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
    >
      <option value="">Select wallet</option>
      {wallets.map((w) => (
        <option key={w.id} value={w.id}>
          {w.owner_name} — {w.id}
        </option>
      ))}
    </select>
  );

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950 dark:text-white">
      <Sidebar
        active={active}
        onNavigate={setActive}
        onLogout={handleLogout}
        profile={profile}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />

      <main className="flex-1 p-6">
        {active === "wallet" && (
          <section>
            <h3 className="mb-2 text-lg font-semibold">Your Wallets</h3>
            {wallets.length === 0 && (
              <p className="mb-4 text-sm opacity-70">No wallets yet.</p>
            )}
            <ul className="mb-4 space-y-1 text-sm">
              {wallets.map((w) => (
                <li
                  key={w.id}
                  className="rounded border p-2 dark:border-gray-700"
                >
                  <strong>{w.owner_name}</strong> — balance: {w.balance}
                  <div className="text-xs opacity-60">ID: {w.id}</div>
                </li>
              ))}
            </ul>

            <h3 className="mb-2 text-lg font-semibold">Create New Wallet</h3>
            <form onSubmit={handleCreateWallet} className="flex gap-2">
              <input
                name="owner"
                placeholder="Wallet owner"
                required
                className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Create
              </button>
            </form>
          </section>
        )}

        {active === "transactions" && (
          <section className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium">Wallet</label>
              {walletSelect(txWalletId, setTxWalletId)}
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold">Deposit</h3>
              <form onSubmit={handleDeposit} className="flex gap-2">
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  required
                  className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Deposit
                </button>
              </form>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">Withdraw</h3>
              <form onSubmit={handleWithdraw} className="flex gap-2">
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  required
                  className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                />
                <button
                  type="submit"
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Withdraw
                </button>
              </form>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold">
                Transfer (from wallet above)
              </h3>
              <form onSubmit={handleTransfer} className="flex gap-2">
                <select
                  name="to_wallet_id"
                  required
                  className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="">Destination wallet</option>
                  {wallets
                    .filter((w) => w.id !== txWalletId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.owner_name} — {w.id}
                      </option>
                    ))}
                </select>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  required
                  className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Transfer
                </button>
              </form>
            </div>
          </section>
        )}

        {active === "history" && (
          <section className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Wallet</label>
              {walletSelect(histWalletId, setHistWalletId)}
            </div>
            <div className="space-x-2">
              <button
                onClick={handleBalance}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                Get Balance
              </button>
              <button
                onClick={handleHistory}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                Transaction History
              </button>
              <button
                onClick={handleDownloadStatement}
                className="bg-gray-700 text-white px-3 py-1 rounded"
              >
                Download PDF Statement
              </button>
            </div>
          </section>
        )}

        {active === "profile" && (
          <section>
            <h3 className="mb-2 text-lg font-semibold">Profile</h3>
            {profile ? (
              <ul className="space-y-1 text-sm">
                <li>
                  <strong>Email:</strong> {profile.email}
                </li>
                <li>
                  <strong>Mobile:</strong> {profile.mobile}
                </li>
                <li>
                  <strong>Gender:</strong> {profile.gender}
                </li>
                <li>
                  <strong>Tenant:</strong> {profile.tenant_name}
                </li>
              </ul>
            ) : (
              <p>Loading…</p>
            )}
          </section>
        )}

        <h4 className="mt-8 mb-1 font-semibold">Response</h4>
        <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-auto">
          {log}
        </pre>
      </main>
    </div>
  );
}
