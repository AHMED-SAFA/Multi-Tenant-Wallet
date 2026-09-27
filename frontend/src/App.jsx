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
  const [wallet, setWallet] = useState(() => {
    const saved = localStorage.getItem("wallet");
    return saved ? JSON.parse(saved) : null;
  });
  const [active, setActive] = useState("wallet");
  const [log, setLog] = useState("");
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("dark") === "true",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("dark", darkMode);
  }, [darkMode]);

  const handleLogout = async () => {
    try {
      await apiLogout(localStorage.getItem("refresh_token"));
    } catch (_) {}
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("wallet");
    setTenant(null);
    setProfile(null);
    setWallet(null);
    setLoggedIn(false);
  };

  useEffect(() => {
    if (loggedIn) {
      getMe()
        .then((res) => setTenant(res.data))
        .catch(() => handleLogout());
      getProfile()
        .then((res) => setProfile(res.data))
        .catch(() => {});
    }
  }, [loggedIn]);

  const show = (res) => setLog(JSON.stringify(res.data, null, 2));
  const showErr = (err) =>
    setLog(JSON.stringify(err.response?.data ?? err.message, null, 2));

  const handleCreateWallet = async (e) => {
    e.preventDefault();
    try {
      const res = await createWallet(e.target.owner.value);
      setWallet(res.data);
      localStorage.setItem("wallet", JSON.stringify(res.data));
      show(res);
    } catch (err) {
      showErr(err);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      show(
        await deposit(wallet.id, e.target.amount.value, crypto.randomUUID()),
      );
    } catch (err) {
      showErr(err);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      show(
        await withdraw(wallet.id, e.target.amount.value, crypto.randomUUID()),
      );
    } catch (err) {
      showErr(err);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      show(
        await transfer(
          wallet.id,
          e.target.to_wallet_id.value,
          e.target.amount.value,
          crypto.randomUUID(),
        ),
      );
    } catch (err) {
      showErr(err);
    }
  };

  const handleBalance = async () => {
    try {
      show(await getBalance(wallet.id));
    } catch (err) {
      showErr(err);
    }
  };

  const handleHistory = async () => {
    try {
      show(await getTransactions(wallet.id));
    } catch (err) {
      showErr(err);
    }
  };

  const handleDownloadStatement = () => {
    const choice = window.prompt(
      "Statement period?\n1 = Last 1 day\n2 = Last 6 days\n3 = Last 12 days",
      "1",
    );
    const daysMap = { 1: 1, 2: 6, 3: 12 };
    const days = daysMap[choice];
    if (!days) return;
    downloadStatement(wallet.id, days);
  };

  if (!loggedIn) return <Auth onLoggedIn={() => setLoggedIn(true)} />;

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
            <h3 className="mb-2 text-lg font-semibold">Create Wallet</h3>
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
            {wallet && (
              <p className="mt-2 text-sm opacity-80">
                Active wallet: {wallet.owner_name} ({wallet.id})
              </p>
            )}
          </section>
        )}

        {active === "transactions" && wallet && (
          <section className="space-y-6">
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
              <h3 className="mb-2 text-lg font-semibold">Transfer</h3>
              <form onSubmit={handleTransfer} className="flex gap-2">
                <input
                  name="to_wallet_id"
                  placeholder="Destination wallet ID"
                  required
                  className="border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                />
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
        {active === "transactions" && !wallet && <p>Create a wallet first.</p>}

        {active === "history" && wallet && (
          <section className="space-x-2">
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
          </section>
        )}
        {active === "history" && !wallet && <p>Create a wallet first.</p>}

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
