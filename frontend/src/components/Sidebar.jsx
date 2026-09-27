import { useState } from "react";
import {
  WalletIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  UserCircleIcon,
  PowerIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import {
  WalletIcon as WalletSolid,
  ArrowsRightLeftIcon as ArrowsSolid,
  ClockIcon as ClockSolid,
  UserCircleIcon as UserSolid,
} from "@heroicons/react/24/solid";

const NAV_ITEMS = [
  {
    key: "wallet",
    label: "Wallets & Accounts",
    icon: WalletIcon,
    activeIcon: WalletSolid,
    desc: "Create & manage tenant balances",
  },
  {
    key: "transactions",
    label: "Transfer & Operations",
    icon: ArrowsRightLeftIcon,
    activeIcon: ArrowsSolid,
    desc: "Deposit, withdraw & transfer",
  },
  {
    key: "history",
    label: "Ledger & Statements",
    icon: ClockIcon,
    activeIcon: ClockSolid,
    desc: "Audit logs & PDF statements",
  },
  {
    key: "profile",
    label: "Tenant Settings",
    icon: UserCircleIcon,
    activeIcon: UserSolid,
    desc: "Identity & security controls",
  },
];

export function SidebarContent({
  active,
  onNavigate,
  onLogout,
  profile,
  walletCount = 0,
  darkMode,
  onToggleDark,
  onClose,
}) {
  const getInitials = (name) => {
    if (!name) return "NP";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <aside className="flex h-full w-72 flex-col justify-between border-r border-slate-200/80 bg-white/90 p-5 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/90 transition-colors">
      {/* Brand & Tenant header */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 shadow-md shadow-indigo-500/25">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              SF<span className="text-indigo-600 dark:text-indigo-400">Pay</span>
            </h1>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Enterprise Ledger
            </p>
          </div>
        </div>

        {/* Active Tenant Card */}
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white p-3 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:to-slate-900/40">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <BuildingOfficeIcon className="h-4 w-4 text-indigo-500" />
            <span>Active Tenant Realm</span>
          </div>
          <p className="mt-1 font-bold text-slate-900 dark:text-white truncate">
            {profile?.tenant_name || "Workspace"}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Isolated DB
            </span>
            <span className="text-slate-400 font-mono">
              {walletCount} {walletCount === 1 ? "Wallet" : "Wallets"}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Main Menu
          </p>
          {NAV_ITEMS.map(({ key, label, icon: Icon, activeIcon: ActiveIcon, desc }) => {
            const isActive = active === key;
            const RenderIcon = isActive ? ActiveIcon : Icon;
            return (
              <button
                key={key}
                onClick={() => {
                  onNavigate(key);
                  onClose?.();
                }}
                className={`group flex w-full items-center gap-3.5 rounded-xl px-3.5 py-3 text-left transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 dark:bg-indigo-600"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white"
                }`}
              >
                <RenderIcon
                  className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-slate-400 dark:text-slate-400"
                  }`}
                />
                <div className="flex-1 truncate">
                  <div className="text-sm font-semibold leading-snug">{label}</div>
                  <div
                    className={`text-[11px] truncate ${
                      isActive ? "text-indigo-100" : "text-slate-400 dark:text-slate-400"
                    }`}
                  >
                    {desc}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile & Controls */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        {/* Dark Mode Switcher */}
        <div className="flex items-center justify-between px-2 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-2">
            {darkMode ? (
              <MoonIcon className="h-4 w-4 text-indigo-400" />
            ) : (
              <SunIcon className="h-4 w-4 text-amber-500" />
            )}
            Theme
          </span>
          <button
            onClick={onToggleDark}
            type="button"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              darkMode ? "bg-indigo-600" : "bg-slate-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                darkMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between rounded-xl bg-slate-100/70 p-2.5 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
              {getInitials(profile?.tenant_name || profile?.email)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                {profile?.email || "Admin User"}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {profile?.mobile || "Administrator"}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Log Out"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition"
          >
            <PowerIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function Sidebar({
  isMobileOpen,
  onCloseMobile,
  ...props
}) {
  return (
    <>
      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72">
            <SidebarContent {...props} onClose={onCloseMobile} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <SidebarContent {...props} />
      </div>
    </>
  );
}

