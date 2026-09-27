import {
  UserCircleIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  KeyIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

export default function ProfileView({ profile, tenant, onLogout }) {
  if (!profile) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Loading profile details...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md border border-white/20 text-2xl font-black">
              {profile.tenant_name
                ? profile.tenant_name.slice(0, 2).toUpperCase()
                : "TE"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black">{profile.tenant_name}</h3>
                <CheckBadgeIcon className="h-6 w-6 text-sky-300" />
              </div>
              <p className="text-xs text-indigo-100 mt-0.5">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-400/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Tenant Active
            </span>
          </div>
        </div>

        {/* Decorative backdrop shapes */}
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <UserCircleIcon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Account Information
              </h4>
              <p className="text-xs text-slate-400">
                Tenant administrator credentials
              </p>
            </div>
          </div>

          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/40">
              <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <EnvelopeIcon className="h-4 w-4" />
                Email Address
              </dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {profile.email}
              </dd>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/40">
              <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <PhoneIcon className="h-4 w-4" />
                Mobile Phone
              </dt>
              <dd className="font-semibold text-slate-900 dark:text-white">
                {profile.mobile || "—"}
              </dd>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800/40">
              <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <UserCircleIcon className="h-4 w-4" />
                Gender
              </dt>
              <dd className="font-semibold capitalize text-slate-900 dark:text-white">
                {profile.gender || "—"}
              </dd>
            </div>

            <div className="flex items-center justify-between py-2">
              <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <BuildingOfficeIcon className="h-4 w-4" />
                Tenant Scope
              </dt>
              <dd className="font-bold text-indigo-600 dark:text-indigo-400">
                {profile.tenant_name}
              </dd>
            </div>
          </dl>
        </div>

        {/* Security & Multi-Tenancy Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Security & Isolation Architecture
              </h4>
              <p className="text-xs text-slate-400">
                Row-level security & JWT authorization
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                <KeyIcon className="h-4 w-4 text-indigo-500" />
                Session Authentication
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
                Multi-Tenant Row-Level Boundary
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              onClick={onLogout}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/60 transition"
            >
              Sign Out of Tenant Workspace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
