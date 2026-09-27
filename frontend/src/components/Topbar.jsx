import {
  Bars3Icon,
  ArrowPathIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency } from "../api";

export default function Topbar({
  active,
  wallets = [],
  onRefresh,
  isRefreshing,
  onOpenApiDrawer,
  hasLogs,
  onOpenMobileSidebar,
}) {
  const titles = {
    wallet: "Wallets & Accounts",
    transactions: "Transfer & Operations Hub",
    history: "Audit Ledger & Statements",
    profile: "Tenant Profile & Security",
  };

  const totalBalance = wallets.reduce(
    (acc, w) => acc + (parseFloat(w.balance) || 0),
    0
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 sm:px-8 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 md:hidden dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {titles[active] || "Dashboard"}
          </h2>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Multi-Tenant Isolation
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Total Aggregate Balance Pill */}
        <div className="hidden lg:flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-1.5 dark:border-slate-800/70 dark:bg-slate-800/50">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
            <WalletIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400 dark:text-slate-500">
              Total Balance
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalBalance)}
            </div>
          </div>
        </div>

        {/* Refresh Wallets Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh All Wallets"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white transition disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
        </button>

        {/* API Inspector Drawer Toggle */}
        <button
          onClick={onOpenApiDrawer}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
            hasLogs
              ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          }`}
        >
          <CodeBracketIcon className="h-4 w-4" />
          <span className="hidden sm:inline">API Inspector</span>
          {hasLogs && (
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
          )}
        </button>
      </div>
    </header>
  );
}
