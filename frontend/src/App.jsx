import { useState, useEffect, useCallback } from "react";
import {
  createWallet,
  listWallets,
  deposit,
  withdraw,
  transfer,
  getMe,
  getProfile,
  logout as apiLogout,
  parseApiError,
  formatCurrency,
} from "./api";

// Layout & UI components
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Toast from "./components/ui/Toast";
import ApiDrawer from "./components/ui/ApiDrawer";

// Views
import AuthView from "./views/AuthView";
import WalletsView from "./views/WalletsView";
import TransactionsView from "./views/TransactionsView";
import HistoryView from "./views/HistoryView";
import ProfileView from "./views/ProfileView";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("access_token"),
  );
  const [tenant, setTenant] = useState(null);
  const [profile, setProfile] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active view & cross-view navigation targets
  const [active, setActive] = useState("wallet");
  const [txInitialTab, setTxInitialTab] = useState("deposit");
  const [txInitialWalletId, setTxInitialWalletId] = useState("");
  const [historyWalletId, setHistoryWalletId] = useState("");

  // API Console & Toast Notifications
  const [log, setLog] = useState("");
  const [isApiDrawerOpen, setIsApiDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Theme & Mobile Navigation
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("dark") === "true",
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("dark", darkMode);
  }, [darkMode]);

  const addToast = useCallback((type, title, message) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const recordApiLog = useCallback((data) => {
    try {
      setLog(JSON.stringify(data, null, 2));
    } catch (_) {
      setLog(String(data));
    }
  }, []);

  const refreshWallets = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await listWallets();
      const data = res.data.results ?? res.data;
      setWallets(Array.isArray(data) ? data : []);
      recordApiLog(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, [recordApiLog]);

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) await apiLogout(refresh);
    } catch (_) {}
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setTenant(null);
    setProfile(null);
    setWallets([]);
    setLoggedIn(false);
    addToast(
      "info",
      "Signed Out",
      "You have been logged out of the tenant realm.",
    );
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
  }, [loggedIn, refreshWallets]);

  // Wallet operations handlers
  const handleCreateWallet = async (ownerName) => {
    try {
      const res = await createWallet(ownerName);
      recordApiLog(res.data);
      addToast(
        "success",
        "Wallet Provisioned",
        `Created wallet account for "${ownerName}" successfully.`,
      );
      await refreshWallets();
      return res;
    } catch (err) {
      const msg = parseApiError(err);
      recordApiLog(err.response?.data ?? err.message);
      addToast("error", "Failed to Create Wallet", msg);
      throw err;
    }
  };

  const handleDeposit = async (walletId, amount, idempotencyKey) => {
    try {
      const res = await deposit(walletId, amount, idempotencyKey);
      recordApiLog(res.data);
      addToast(
        "success",
        "Deposit Confirmed",
        `Successfully credited ${formatCurrency(amount)} to wallet.`,
      );
      await refreshWallets();
      return res;
    } catch (err) {
      const msg = parseApiError(err);
      recordApiLog(err.response?.data ?? err.message);
      addToast("error", "Deposit Failed", msg);
      throw err;
    }
  };

  const handleWithdraw = async (walletId, amount, idempotencyKey) => {
    try {
      const res = await withdraw(walletId, amount, idempotencyKey);
      recordApiLog(res.data);
      addToast(
        "success",
        "Withdrawal Confirmed",
        `Successfully debited ${formatCurrency(amount)} from wallet.`,
      );
      await refreshWallets();
      return res;
    } catch (err) {
      const msg = parseApiError(err);
      recordApiLog(err.response?.data ?? err.message);
      addToast("error", "Withdrawal Failed", msg);
      throw err;
    }
  };

  const handleTransfer = async (
    fromWalletId,
    toWalletId,
    amount,
    idempotencyKey,
  ) => {
    try {
      const res = await transfer(
        fromWalletId,
        toWalletId,
        amount,
        idempotencyKey,
      );
      recordApiLog(res.data);
      addToast(
        "success",
        "Transfer Completed",
        `Transferred ${formatCurrency(amount)} across tenant wallets with atomic lock.`,
      );
      await refreshWallets();
      return res;
    } catch (err) {
      const msg = parseApiError(err);
      recordApiLog(err.response?.data ?? err.message);
      addToast("error", "Transfer Failed", msg);
      throw err;
    }
  };

  // Quick navigation helpers from Wallets grid cards
  const navigateToTx = (action, walletId) => {
    setTxInitialTab(action);
    setTxInitialWalletId(walletId);
    setActive("transactions");
  };

  const navigateToHistory = (walletId) => {
    setHistoryWalletId(walletId);
    setActive("history");
  };

  if (!loggedIn) {
    return (
      <>
        <AuthView onLoggedIn={() => setLoggedIn(true)} />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Sleek Enterprise Sidebar */}
      <Sidebar
        active={active}
        onNavigate={setActive}
        onLogout={handleLogout}
        profile={profile}
        walletCount={wallets.length}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar
          active={active}
          wallets={wallets}
          onRefresh={refreshWallets}
          isRefreshing={isRefreshing}
          onOpenApiDrawer={() => setIsApiDrawerOpen(true)}
          hasLogs={!!log}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {active === "wallet" && (
            <WalletsView
              wallets={wallets}
              onCreateWallet={handleCreateWallet}
              onNavigateToTx={navigateToTx}
              onNavigateToHistory={navigateToHistory}
              profile={profile}
            />
          )}

          {active === "transactions" && (
            <TransactionsView
              wallets={wallets}
              initialTab={txInitialTab}
              initialWalletId={txInitialWalletId}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
              onTransfer={handleTransfer}
              onNavigateToHistory={navigateToHistory}
            />
          )}

          {active === "history" && (
            <HistoryView
              wallets={wallets}
              initialWalletId={historyWalletId}
              onShowApiLog={(res) => recordApiLog(res.data)}
            />
          )}

          {active === "profile" && (
            <ProfileView
              profile={profile}
              tenant={tenant}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Global Notifications Toast System */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Live API Inspector Drawer */}
      <ApiDrawer
        isOpen={isApiDrawerOpen}
        onClose={() => setIsApiDrawerOpen(false)}
        log={log}
        onClear={() => setLog("")}
      />
    </div>
  );
}
