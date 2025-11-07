import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AdminPanel from "./AdminPanel";

export default function AdminRoute() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return <div>Loading…</div>;

  const isAdmin = session?.user?.user_metadata?.role === "admin";
  if (!session) {
    return (
      <LoginForm emailSent={emailSent} onSent={() => setEmailSent(true)} />
    );
  }
  if (!isAdmin) return <div className="text-red-400">403 • Admins only.</div>;

  return <AdminPanel />;
}

function LoginForm({ emailSent, onSent }: { emailSent: boolean; onSent: () => void }) {
  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email") as string;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + "/admin" } });
    if (error) alert(error.message);
    else onSent();
  }
  return (
    <div className="max-w-md mx-auto p-6 rounded-xl border bg-neutral-900/40">
      <h2 className="text-xl font-semibold mb-3">Admin sign-in</h2>
      {emailSent ? (
        <p className="text-sm opacity-80">Magic link sent. Check your inbox.</p>
      ) : (
        <form onSubmit={handle} className="space-y-3">
          <input name="email" type="email" required placeholder="you@email.com" className="w-full rounded-lg px-3 py-2 bg-neutral-800 border border-neutral-700" />
          <button className="px-3 py-2 rounded-lg bg-[rgb(var(--accent))] text-black font-medium">Send magic link</button>
        </form>
      )}
    </div>
  );
}
