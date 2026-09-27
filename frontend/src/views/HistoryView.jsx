import { useState, useEffect } from "react";
import {
  ClockIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ArrowsRightLeftIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import {
  getBalance,
  getTransactions,
  downloadStatement,
  formatCurrency,
  formatDateTime,
  shortenId,
} from "../api";

export default function HistoryView({
  wallets = [],
  initialWalletId = "",
  onShowApiLog,
}) {
  const [selectedWalletId, setSelectedWalletId] = useState(
    initialWalletId || (wallets[0]?.id ?? ""),
  );
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [periodDays, setPeriodDays] = useState(6);
  const [filterType, setFilterType] = useState("all");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (initialWalletId) {
      setSelectedWalletId(initialWalletId);
    } else if (!selectedWalletId && wallets.length > 0) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [initialWalletId, wallets]);

  const loadData = async (wId) => {
    if (!wId) return;
    setLoading(true);
    try {
      const [balRes, txRes] = await Promise.all([
        getBalance(wId),
        getTransactions(wId),
      ]);
      setBalance(balRes.data?.balance);
      const list = txRes.data?.results ?? txRes.data;
      setTransactions(Array.isArray(list) ? list : []);
      onShowApiLog?.(balRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWalletId) {
      loadData(selectedWalletId);
    }
  }, [selectedWalletId]);

  const handleDownload = async () => {
    if (!selectedWalletId) return;
    setDownloading(true);
    try {
      await downloadStatement(selectedWalletId, periodDays);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "all") return true;
    if (filterType === "deposit") return tx.type === "deposit";
    if (filterType === "withdraw") return tx.type === "withdraw";
    if (filterType === "transfer")
      return tx.type === "transfer_in" || tx.type === "transfer_out";
    return true;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case "deposit":
        return {
          label: "Deposit",
          bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
          icon: <ArrowDownLeftIcon className="h-3.5 w-3.5" />,
          isPositive: true,
        };
      case "withdraw":
        return {
          label: "Withdrawal",
          bg: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800",
          icon: <ArrowUpRightIcon className="h-3.5 w-3.5" />,
          isPositive: false,
        };
      case "transfer_in":
        return {
          label: "Transfer In",
          bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
          icon: <ArrowsRightLeftIcon className="h-3.5 w-3.5" />,
          isPositive: true,
        };
      case "transfer_out":
        return {
          label: "Transfer Out",
          bg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
          icon: <ArrowsRightLeftIcon className="h-3.5 w-3.5" />,
          isPositive: false,
        };
      default:
        return {
          label: type,
          bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
          icon: <ClockIcon className="h-3.5 w-3.5" />,
          isPositive: false,
        };
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Top Controls: Wallet Selector & PDF Export */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Selection & Balance Snapshot Card */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Audit Scope
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                Select Account to Inspect
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedWalletId}
                onChange={(e) => setSelectedWalletId(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.owner_name} ({shortenId(w.id, 6)})
                  </option>
                ))}
              </select>

              <button
                onClick={() => loadData(selectedWalletId)}
                disabled={loading || !selectedWalletId}
                title="Refresh Ledger"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
              >
                <ArrowPathIcon
                  className={`h-4 w-4 ${loading ? "animate-spin text-indigo-600" : ""}`}
                />
              </button>
            </div>
          </div>

          {selectedWallet && (
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400 font-medium">
                  Recomputed Ledger Balance
                </p>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {formatCurrency(
                    balance !== null ? balance : selectedWallet.balance,
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Owner:{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {selectedWallet.owner_name}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div className="mt-1 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Cryptographically Verified Ledger
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PDF Statement Generator Card */}
        <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white p-6 shadow-sm dark:border-indigo-950/60 dark:from-slate-900 dark:to-slate-900/60 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                Official Statement
              </span>
              <DocumentArrowDownIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
              Download PDF Report
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Export an official auditor-ready PDF with complete transaction
              logs, timestamps, and balance trails.
            </p>

            {/* Period Selection Buttons */}
            <div className="mt-4 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Statement Period
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "1 Day", val: 1 },
                  { label: "6 Days", val: 6 },
                  { label: "12 Days", val: 12 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setPeriodDays(p.val)}
                    className={`rounded-xl py-1.5 text-xs font-semibold transition ${
                      periodDays === p.val
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading || !selectedWalletId}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition active:scale-95"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>
              {downloading ? "Generating PDF..." : "Export PDF Statement"}
            </span>
          </button>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="rounded-3xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden transition-colors">
        {/* Table Filters & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Ledger Transactions
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Historical ledger entries for the active wallet
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
            {["all", "deposit", "withdraw", "transfer"].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition ${
                  filterType === f
                    ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
            <ArrowPathIcon className="h-5 w-5 animate-spin mr-2 text-indigo-500" />
            Loading transaction history...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <ClockIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 stroke-1" />
            <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              No transactions recorded for this wallet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Deposit or transfer funds to begin building this wallet's
              immutable history.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/50 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Type & Reference</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Balance After</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5 text-right">Idempotency Key</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredTransactions.map((tx) => {
                  const badge = getTypeBadge(tx.type);
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Type & ID */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.bg}`}
                          >
                            {badge.icon}
                            {badge.label}
                          </span>
                          
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 font-bold">
                        <span
                          className={
                            badge.isPositive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-slate-900 dark:text-slate-200"
                          }
                        >
                          {badge.isPositive ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Balance After */}
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                        {formatCurrency(tx.balance_after)}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDateTime(tx.created_at)}
                      </td>

                      {/* Idempotency Key with copy */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400">
                          <span>{shortenId(tx.idempotency_key, 6)}</span>
                          <button
                            onClick={() => handleCopy(tx.idempotency_key)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                            title="Copy key"
                          >
                            {copiedId === tx.idempotency_key ? (
                              <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
