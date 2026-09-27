import { useState } from "react";
import {
  WalletIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  UserCircleIcon,
  PowerIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/solid";

const NAV_ITEMS = [
  { key: "wallet", label: "Create Wallet", icon: WalletIcon },
  { key: "transactions", label: "Transactions", icon: ArrowsRightLeftIcon },
  { key: "history", label: "Balance / History", icon: ClockIcon },
  { key: "profile", label: "Profile", icon: UserCircleIcon },
];

function SidebarContent({
  active,
  onNavigate,
  onLogout,
  profile,
  darkMode,
  onToggleDark,
  onClose,
}) {
  return (
    <div className="flex h-full w-64 flex-col bg-white p-4 dark:bg-gray-900">
      <div className="mb-4 p-2">
        <p className="font-semibold text-gray-900 dark:text-white">
          {profile ? profile.email : "Loading…"}
        </p>
        {profile && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {profile.tenant_name}
          </p>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              onNavigate(key);
              onClose?.();
            }}
            className={`flex items-center gap-3 rounded px-3 py-2 text-left text-sm
              ${
                active === key
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}

        <hr className="my-2 border-gray-200 dark:border-gray-700" />

        <div className="flex items-center justify-between rounded px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
          <span className="flex items-center gap-3">
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
            Dark Mode
          </span>
          <button
            onClick={onToggleDark}
            className={`h-6 w-11 rounded-full transition-colors ${darkMode ? "bg-blue-600" : "bg-gray-300"}`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition-transform
              ${darkMode ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <PowerIcon className="h-5 w-5" />
          Log Out
        </button>
      </nav>
    </div>
  );
}

export default function Sidebar(props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <div className="p-2 md:hidden">
        <button onClick={() => setIsDrawerOpen(true)}>
          <Bars3Icon className="h-8 w-8 text-gray-900 dark:text-white" />
        </button>
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative z-10">
            <div className="flex justify-end p-2">
              <button onClick={() => setIsDrawerOpen(false)}>
                <XMarkIcon className="h-6 w-6 text-gray-900 dark:text-white" />
              </button>
            </div>
            <SidebarContent {...props} onClose={() => setIsDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="hidden md:block">
        <SidebarContent {...props} />
      </div>
    </>
  );
}
