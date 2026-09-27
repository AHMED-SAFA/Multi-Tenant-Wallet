import { useState } from "react";
import {
  CodeBracketIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  TrashIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export default function ApiDrawer({ isOpen, onClose, log, onClear }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!log) return;
    navigator.clipboard.writeText(log);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-slate-900 text-slate-100 shadow-2xl border-l border-slate-800 backdrop-blur-xl animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-500/20 p-1.5 text-indigo-400">
            <CodeBracketIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">API Inspector & Console</h3>
            <p className="text-xs text-slate-400">Real-time ledger payload & server response log</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {log && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition"
                title="Copy JSON"
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-4 w-4 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={onClear}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-rose-900/40 hover:text-rose-300 transition"
                title="Clear Logs"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Clear</span>
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 font-mono text-xs">
        {log ? (
          <pre className="whitespace-pre-wrap break-words rounded-xl bg-slate-950/80 p-4 border border-slate-800/80 text-emerald-400 leading-relaxed shadow-inner">
            {log}
          </pre>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
            <CodeBracketIcon className="h-10 w-10 stroke-1 text-slate-600 mb-2" />
            <p className="text-sm font-medium">No API calls recorded yet</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Trigger any wallet action, transaction, or balance inquiry to inspect payload data here.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 bg-slate-950/50 px-6 py-3 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Interceptor Active
        </span>
        <span className="text-slate-400">Endpoint: http://localhost:8000/api</span>
      </div>
    </div>
  );
}
