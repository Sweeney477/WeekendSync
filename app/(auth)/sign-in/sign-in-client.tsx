"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function SignInClient() {
  const sp = useSearchParams();
  const inviteCode = sp.get("inviteCode") ?? "";
  const next = sp.get("next") ?? "";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const normalizedEmail = email.trim();

  async function onSendCode() {
    setStatus("sending");
    setError(null);
    try {
      const { createBrowserSupabaseClient } = await import("@/lib/supabase/browser");
      const supabase = createBrowserSupabaseClient();
      
      const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
      if (inviteCode) callbackUrl.searchParams.set("inviteCode", inviteCode);
      if (next) callbackUrl.searchParams.set("next", next);

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: callbackUrl.toString(),
        },
      });
      if (signInError) throw signInError;
      setStatus("sent");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to send code");
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8 pb-24">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-slate-600">We’ll email you a one-time code link. No password.</p>
      </header>

      <Card className="flex flex-col gap-3">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={onSendCode} isLoading={status === "sending"} disabled={!normalizedEmail}>
          Send sign-in link
        </Button>
        {status === "sent" ? <p className="text-sm text-slate-700">Check your email for the sign-in link.</p> : null}
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      </Card>

      <Link className="text-sm font-medium text-brand-700 underline" href="/">
        Back
      </Link>
    </main>
  );
}

