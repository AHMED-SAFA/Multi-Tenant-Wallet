import { useState } from "react";
import {
  PlusIcon,
  WalletIcon,
  BanknotesIcon,
  BuildingOffice2Icon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { formatCurrency, shortenId } from "../api";
import Modal from "../components/ui/Modal";

export default function WalletsView({
  wallets = [],
  onCreateWallet,
  onNavigateToTx,
  onNavigateToHistory,
  profile,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ownerInput, setOwnerInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const totalBalance = wallets.reduce(
    (acc, w) => acc + (parseFloat(w.balance) || 0),
    0,
  );

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ownerInput.trim()) return;
    setSubmitting(true);
    try {
      await onCreateWallet(ownerInput.trim());
      setOwnerInput("");
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Balance */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Total Managed Balance
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <BanknotesIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(totalBalance)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              Real-time
            </span>
            <span>across all tenant accounts</span>
          </div>
        </div>

        {/* Total Wallets */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Wallets
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <WalletIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {wallets.length}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Partitioned strictly per tenant ledger
          </div>
        </div>

        {/* Tenant Scope */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 transition-colors sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Workspace
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
              <BuildingOffice2Icon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-xl font-bold text-slate-900 dark:text-white truncate">
            {profile?.tenant_name || "Enterprise Tenant"}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="truncate">
              {profile?.email || "Authenticated Tenant"}
            </span>
          </div>
        </div>
      </div>

      {/* Action Header & Create Wallet Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Wallets Catalog
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select a wallet to transfer funds, record deposits, or audit
            transaction history.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition active:scale-95"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Wallet</span>
        </button>
      </div>

      {/* Wallets Grid */}
      {wallets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-4">
            <WalletIcon className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            No wallets created yet
          </h4>
          <p className="mx-auto max-w-sm text-sm text-slate-500 dark:text-slate-400 mt-1">
            Get started by initializing a new wallet account for your tenant
            members or business units.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition"
          >
            <PlusIcon className="h-4 w-4" />
            Create First Wallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {wallets.map((w) => (
            <div
              key={w.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity" />

              <div>
                {/* Header with Card Chip & Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-9 rounded bg-amber-400/80 border border-amber-500 flex items-center justify-center shadow-inner">
                      <div className="h-3 w-5 border border-amber-600/50 rounded-sm"></div>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Standard
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                    Active
                  </span>
                </div>

                {/* Owner Name */}
                <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {w.owner_name}
                </h4>

                {/* Wallet ID with Copy Action */}
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono">
                    {shortenId("ID:" + w.id, 8)}
                  </span>
                  <button
                    onClick={() => handleCopy(w.id)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    title="Copy full UUID"
                  >
                    {copiedId === w.id ? (
                      <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <ClipboardDocumentIcon className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* Balance Display */}
                <div className="mt-6 mb-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Available Balance
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                    {formatCurrency(w.balance)}
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                <button
                  onClick={() => onNavigateToTx("deposit", w.id)}
                  className="flex flex-col items-center justify-center rounded-xl bg-emerald-50/70 p-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition"
                >
                  <ArrowDownLeftIcon className="h-4 w-4 mb-0.5 text-emerald-600 dark:text-emerald-400" />
                  Deposit
                </button>

                <button
                  onClick={() => onNavigateToTx("withdraw", w.id)}
                  className="flex flex-col items-center justify-center rounded-xl bg-rose-50/70 p-2 text-xs font-semibold text-rose-700 hover:bg-rose-100/80 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 transition"
                >
                  <ArrowUpRightIcon className="h-4 w-4 mb-0.5 text-rose-600 dark:text-rose-400" />
                  Withdraw
                </button>

                <button
                  onClick={() => onNavigateToTx("transfer", w.id)}
                  className="flex flex-col items-center justify-center rounded-xl bg-indigo-50/70 p-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition"
                >
                  <ArrowsRightLeftIcon className="h-4 w-4 mb-0.5 text-indigo-600 dark:text-indigo-400" />
                  Transfer
                </button>
              </div>

              {/* History / Statement Link */}
              <button
                onClick={() => onNavigateToHistory(w.id)}
                className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition"
              >
                <DocumentTextIcon className="h-3.5 w-3.5" />
                View Ledger & PDF Statement
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Wallet Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Wallet"
        subtitle="Provision an isolated ledger account under your tenant namespace"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Wallet Name
            </label>
            <input
              type="text"
              value={ownerInput}
              onChange={(e) => setOwnerInput(e.target.value)}
              placeholder="e.g. Finance Dept, Alice, Operations Vault"
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Security Guarantee:{" "}
            </span>
            A unique cryptographic UUID will be assigned. Initial balance starts
            at $0.00 backed by double-entry ledger verification.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !ownerInput.trim()}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 disabled:opacity-50 transition"
            >
              {submitting ? "Provisioning..." : "Create Wallet"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
