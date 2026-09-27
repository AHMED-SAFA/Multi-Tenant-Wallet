import { useEffect } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const typeStyles = {
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-100",
      icon: <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      accent: "bg-emerald-500",
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-100",
      icon: <ExclamationCircleIcon className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
      accent: "bg-rose-500",
    },
    info: {
      bg: "bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-950/80 dark:border-indigo-800 dark:text-indigo-100",
      icon: <InformationCircleIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />,
      accent: "bg-indigo-500",
    },
  }[toast.type || "info"];

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${typeStyles.bg}`}
    >
      {typeStyles.icon}
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold text-sm leading-tight">{toast.title}</p>}
        <p className="text-xs leading-normal mt-0.5 break-words opacity-90">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
