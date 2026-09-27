import { useState, useEffect } from "react";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ArrowsRightLeftIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency, shortenId } from "../api";

export default function TransactionsView({
  wallets = [],
  initialTab = "deposit",
  initialWalletId = "",
  onDeposit,
  onWithdraw,
  onTransfer,
  onNavigateToHistory,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedWalletId, setSelectedWalletId] = useState(initialWalletId);
  const [targetWalletId, setTargetWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [idempotencyKey, setIdempotencyKey] = useState(crypto.randomUUID());

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
    if (initialWalletId) setSelectedWalletId(initialWalletId);
  }, [initialTab, initialWalletId]);

  // Keep a selected wallet if possible
  useEffect(() => {
    if (!selectedWalletId && wallets.length > 0) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets, selectedWalletId]);

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const targetWallet = wallets.find((w) => w.id === targetWalletId);

  const quickAmounts = [25, 50, 100, 250, 500, 1000];

  const handleRegenerateKey = () => {
    setIdempotencyKey(crypto.randomUUID());
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSuccessResult(null);
    setAmount("");
    handleRegenerateKey();
  };

  const currentBalance = selectedWallet ? parseFloat(selectedWallet.balance) || 0 : 0;
  const numAmount = parseFloat(amount) || 0;
  const isInsufficient = (activeTab === "withdraw" || activeTab === "transfer") && numAmount > currentBalance;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWalletId) return;
    if (numAmount <= 0) return;
    if (isInsufficient) return;

    setIsProcessing(true);
    setSuccessResult(null);

    try {
      let res;
      if (activeTab === "deposit") {
        res = await onDeposit(selectedWalletId, amount, idempotencyKey);
      } else if (activeTab === "withdraw") {
        res = await onWithdraw(selectedWalletId, amount, idempotencyKey);
      } else if (activeTab === "transfer") {
        if (!targetWalletId) return;
        res = await onTransfer(selectedWalletId, targetWalletId, amount, idempotencyKey);
      }

      setSuccessResult({
        tab: activeTab,
        data: res?.data,
        amount: numAmount,
        sourceWallet: selectedWallet?.owner_name,
        targetWallet: targetWallet?.owner_name,
      });
      setAmount("");
      handleRegenerateKey();
    } catch (_) {
      // Errors handled by parent toast & inspector
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Tab Navigation */}
      <div className="flex rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => handleTabChange("deposit")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
            activeTab === "deposit"
              ? "bg-white text-emerald-700 shadow-md shadow-emerald-900/5 dark:bg-slate-900 dark:text-emerald-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <ArrowDownLeftIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          Deposit Funds
        </button>

        <button
          onClick={() => handleTabChange("withdraw")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
            activeTab === "withdraw"
              ? "bg-white text-rose-700 shadow-md shadow-rose-900/5 dark:bg-slate-900 dark:text-rose-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <ArrowUpRightIcon className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          Withdraw Funds
        </button>

        <button
          onClick={() => handleTabChange("transfer")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
            activeTab === "transfer"
              ? "bg-white text-indigo-700 shadow-md shadow-indigo-900/5 dark:bg-slate-900 dark:text-indigo-400"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          <ArrowsRightLeftIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          Transfer Between Wallets
        </button>
      </div>

      {/* Main Terminal Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
        {wallets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">
              No wallets available yet. Please create a wallet first in the Wallets tab.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wallet Selection Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source Wallet Card */}
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  {activeTab === "transfer" ? "Source Wallet (Debited)" : "Operating Wallet"}
                </label>
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">Select a wallet...</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.owner_name} — {formatCurrency(w.balance)}
                    </option>
                  ))}
                </select>

                {selectedWallet && (
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Current Balance:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(selectedWallet.balance)}
                    </span>
                  </div>
                )}
              </div>

              {/* Destination Wallet (only in transfer mode) */}
              {activeTab === "transfer" ? (
                <div className="rounded-2xl border border-indigo-200/80 p-4 bg-indigo-50/40 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2">
                    Destination Wallet (Credited)
                  </label>
                  <select
                    value={targetWalletId}
                    onChange={(e) => setTargetWalletId(e.target.value)}
                    required
                    className="w-full rounded-xl border border-indigo-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Select recipient wallet...</option>
                    {wallets
                      .filter((w) => w.id !== selectedWalletId)
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.owner_name} — {formatCurrency(w.balance)}
                        </option>
                      ))}
                  </select>

                  {targetWallet && (
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-indigo-200/60 dark:border-indigo-800/60 text-xs">
                      <span className="text-indigo-600 dark:text-indigo-400">Recipient Balance:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(targetWallet.balance)}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* Information Tile for Single-Wallet operations */
                <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                    Ledger Guarantee
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {activeTab === "deposit"
                      ? "Deposits immediately credit the ledger and recalculate available balances using atomic row-level locking."
                      : "Withdrawals perform real-time non-negative balance validation to ensure zero overdraft risk."}
                  </p>
                </div>
              )}
            </div>

            {/* Amount Section */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Transaction Amount (USD)
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-xl font-bold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className={`w-full rounded-2xl border bg-white py-4 pl-9 pr-4 text-2xl font-black tracking-tight text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white ${
                    isInsufficient
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700"
                  }`}
                />
              </div>

              {/* Insufficient balance warning */}
              {isInsufficient && (
                <div className="flex items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                  <ExclamationTriangleIcon className="h-4 w-4 shrink-0" />
                  <span>Amount exceeds available wallet balance of {formatCurrency(currentBalance)}.</span>
                </div>
              )}

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-slate-400 font-medium mr-1">Quick Select:</span>
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(q.toString())}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    +${q}
                  </button>
                ))}
                {selectedWallet && (
                  <button
                    type="button"
                    onClick={() => setAmount(selectedWallet.balance.toString())}
                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 transition"
                  >
                    Max ({formatCurrency(selectedWallet.balance)})
                  </button>
                )}
              </div>
            </div>

            {/* Idempotency Protection Indicator */}
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <ShieldCheckIcon className="h-4 w-4 text-indigo-500 shrink-0" />
                <span className="truncate">
                  Idempotency Key: <span className="font-mono">{shortenId(idempotencyKey, 8)}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleRegenerateKey}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 shrink-0 ml-2"
              >
                Regenerate
              </button>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isProcessing || !selectedWalletId || isInsufficient || numAmount <= 0}
              className={`w-full rounded-2xl py-4 text-base font-bold text-white shadow-xl transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none ${
                activeTab === "deposit"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25"
                  : activeTab === "withdraw"
                  ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/25"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25"
              }`}
            >
              {isProcessing
                ? "Recording Transaction in Ledger..."
                : activeTab === "deposit"
                ? `Deposit ${amount ? formatCurrency(amount) : ""}`
                : activeTab === "withdraw"
                ? `Withdraw ${amount ? formatCurrency(amount) : ""}`
                : `Transfer ${amount ? formatCurrency(amount) : ""} to Recipient`}
            </button>
          </form>
        )}
      </div>

      {/* Success Receipt Banner */}
      {successResult && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/90 p-6 dark:border-emerald-900/60 dark:bg-emerald-950/40 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
              <CheckCircleIcon className="h-7 w-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                Transaction Completed Successfully
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                {successResult.tab === "transfer"
                  ? `Transferred ${formatCurrency(successResult.amount)} from ${successResult.sourceWallet} to ${successResult.targetWallet}.`
                  : `${successResult.tab.toUpperCase()} of ${formatCurrency(successResult.amount)} processed on ${successResult.sourceWallet}.`}
              </p>

              {successResult.data?.transaction_id && (
                <div className="mt-3 flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-200">
                  <span className="opacity-70">Tx ID:</span>
                  <span className="font-semibold">{successResult.data.transaction_id}</span>
                </div>
              )}

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => onNavigateToHistory(selectedWalletId)}
                  className="rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-sm hover:bg-emerald-100 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800 transition"
                >
                  View in Ledger History
                </button>
                <button
                  onClick={() => setSuccessResult(null)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
