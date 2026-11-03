"use client";

import { useState, type FormEvent } from "react";
import { Trash2, UserPlus, UserRound, X } from "lucide-react";
import type { FirmUser } from "./types";

const demoFirmUsers: FirmUser[] = [
  { name: "Aarav Shah", email: "aarav.shah@example.com", role: "Investment Partner" },
  { name: "Mira Patel", email: "mira.patel@example.com", role: "Principal" },
  { name: "Rohan Mehta", email: "rohan.mehta@example.com", role: "Investment Director" },
  { name: "Anaya Desai", email: "anaya.desai@example.com", role: "Vice President" },
  { name: "Kabir Joshi", email: "kabir.joshi@example.com", role: "Associate" },
  { name: "Ishita Rao", email: "ishita.rao@example.com", role: "Senior Associate" },
  { name: "Dev Malhotra", email: "dev.malhotra@example.com", role: "Investment Analyst" },
  { name: "Nisha Kapoor", email: "nisha.kapoor@example.com", role: "Platform Manager" },
  { name: "Arjun Nair", email: "arjun.nair@example.com", role: "Operations Lead" },
  { name: "Tara Iyer", email: "tara.iyer@example.com", role: "Legal & Compliance" },
];

type PendingRemoval = { email: string; name: string; isDemo: boolean };

export default function FirmUsersSection({ ownerName, ownerEmail }: { ownerName: string; ownerEmail: string }) {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [additionalUsers, setAdditionalUsers] = useState<string[]>([]);
  const [removedDemoUsers, setRemovedDemoUsers] = useState<string[]>([]);
  const [userToRemove, setUserToRemove] = useState<PendingRemoval | null>(null);

  const addFirmUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedEmail = inviteEmail.trim().toLowerCase();
    if (!normalizedEmail) return setInviteError("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return setInviteError("Enter a valid email address");
    if (normalizedEmail === ownerEmail.toLowerCase() || demoFirmUsers.some((user) => user.email === normalizedEmail) || additionalUsers.includes(normalizedEmail)) {
      return setInviteError("This email is already added to your firm");
    }
    setAdditionalUsers((users) => [...users, normalizedEmail]);
    setInviteEmail("");
    setInviteError("");
    setShowInviteForm(false);
  };

  const confirmRemove = () => {
    if (!userToRemove) return;
    if (userToRemove.isDemo) setRemovedDemoUsers((users) => [...users, userToRemove.email]);
    else setAdditionalUsers((users) => users.filter((user) => user !== userToRemove.email));
    setUserToRemove(null);
  };

  return (
    <>
      <section className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div><h3 className="text-sm font-bold text-slate-900">Firm users</h3><p className="mt-1 text-xs text-slate-500">Manage who from your firm can work with this application.</p></div>
          <button type="button" onClick={() => { setInviteError(""); setShowInviteForm(true); }} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"><UserPlus className="h-4 w-4" /> Add firm user</button>
        </div>
        <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">{ownerName.charAt(0).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-900">{ownerName} <span className="ml-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">You · Firm owner</span></p><p className="mt-1 truncate text-xs text-slate-500">{ownerEmail}</p></div></div>
          </div>
          {demoFirmUsers.filter((user) => !removedDemoUsers.includes(user.email)).map((user) => (
            <div key={user.email} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">{user.name.split(" ").map((part) => part[0]).join("")}</span><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-900">{user.name}<span className="ml-2 font-normal text-slate-500">{user.role}</span></p><p className="mt-1 truncate text-xs text-slate-500">{user.email}</p></div></div>
              <button type="button" onClick={() => setUserToRemove({ email: user.email, name: user.name, isDemo: true })} className="rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50">Remove</button>
            </div>
          ))}
          {additionalUsers.map((userEmail) => (
            <div key={userEmail} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700"><UserRound className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-900">Firm user</p><p className="mt-1 truncate text-xs text-slate-500">{userEmail}</p></div></div>
              <button type="button" onClick={() => setUserToRemove({ email: userEmail, name: "Firm user", isDemo: false })} className="rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50">Remove</button>
            </div>
          ))}
        </div>
      </section>

      {showInviteForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && setShowInviteForm(false)}>
        <form noValidate onSubmit={addFirmUser} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-900">Add a firm user</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">Add a colleague to your firm’s application workspace.</p></div><button type="button" aria-label="Close" onClick={() => setShowInviteForm(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button></div>
          <label htmlFor="firm-user-email" className="mt-5 block text-xs font-semibold text-slate-700">Firm user email</label>
          <input id="firm-user-email" type="email" required autoFocus value={inviteEmail} onChange={(event) => { setInviteEmail(event.target.value); if (inviteError) setInviteError(""); }} placeholder="colleague@yourfirm.com" aria-invalid={Boolean(inviteError)} aria-describedby={inviteError ? "firm-user-email-error" : undefined} className={`mt-2 w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${inviteError ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"}`} />
          {inviteError && <p id="firm-user-email-error" className="mt-1.5 text-xs font-medium text-rose-600">{inviteError}</p>}
          <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShowInviteForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"><UserPlus className="h-4 w-4" /> Add user</button></div>
        </form>
      </div>}

      {userToRemove && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => event.target === event.currentTarget && setUserToRemove(null)}>
        <div role="alertdialog" aria-modal="true" aria-labelledby="remove-firm-user-title" className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><Trash2 className="h-5 w-5" /></div><h2 id="remove-firm-user-title" className="mt-4 text-lg font-bold text-slate-900">Remove firm user?</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">Remove <span className="font-semibold text-slate-700">{userToRemove.name}</span> ({userToRemove.email}) from this firm users list?</p>
          <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setUserToRemove(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button type="button" onClick={confirmRemove} className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700">Remove user</button></div>
        </div>
      </div>}
    </>
  );
}
