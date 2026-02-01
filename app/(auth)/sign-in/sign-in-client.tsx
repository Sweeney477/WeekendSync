"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function SignInClient() {
  const sp = useSearchParams();
  const inviteCode = sp.get("inviteCode") ?? "";
  const next = sp.get("next") ?? "";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const normalizedEmail = email.trim();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  function setPendingJoinCookie() {
    if (inviteCode || next) {
      const payload = encodeURIComponent(JSON.stringify({ inviteCode: inviteCode || "", next }));
      document.cookie = `pending_join=${payload}; path=/; max-age=600; SameSite=Lax`;
    }
  }

  function buildCallbackUrl() {
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    if (inviteCode) callbackUrl.searchParams.set("inviteCode", inviteCode);
    if (next) callbackUrl.searchParams.set("next", next);
    return callbackUrl.toString();
  }

  async function onSignInWithGoogle() {
    setGoogleLoading(true);
    setError(null);
    try {
      const { createBrowserSupabaseClient } = await import("@/lib/supabase/browser");
      const supabase = createBrowserSupabaseClient();
      setPendingJoinCookie();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: buildCallbackUrl() },
      });
      if (oauthError) throw oauthError;
    } catch (e) {
      setGoogleLoading(false);
      setError(e instanceof Error ? e.message : "Failed to sign in with Google");
    }
  }

  async function onSendCode() {
    setStatus("sending");
    setError(null);
    try {
      const { createBrowserSupabaseClient } = await import("@/lib/supabase/browser");
      const supabase = createBrowserSupabaseClient();
      setPendingJoinCookie();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: buildCallbackUrl(),
        },
      });
      if (signInError) throw signInError;
      setStatus("sent");
      setResendCooldown(60);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to send code");
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-4 py-8 pb-24">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-slate-600 dark:text-muted-dark">We’ll email you a one-time sign-in link. No password needed.</p>
      </header>

      <Card className="flex flex-col gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onSignInWithGoogle}
          isLoading={googleLoading}
          disabled={googleLoading}
          className="flex items-center justify-center gap-2"
        >
          <GoogleIcon />
          Sign in with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-2 text-sm text-slate-500 dark:bg-surface-dark dark:text-slate-400">or</span>
          </div>
        </div>

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
        {status === "sent" ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-slate-700 dark:text-ink-dark">Check your email for the sign-in link.</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">If you don&apos;t see it, check spam or promotions.</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Link expires in 1 hour. You can request a new one anytime.</p>
            <Button
              type="button"
              variant="ghost"
              onClick={onSendCode}
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend link (${resendCooldown}s)` : "Resend link"}
            </Button>
          </div>
        ) : null}
        {error ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm text-rose-700 dark:text-rose-400" role="alert">
              {error}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Check your email address or try again in a minute.</p>
          </div>
        ) : null}
      </Card>

      <Link className="text-sm font-medium text-brand-800 dark:text-brand-400 underline" href="/">
        Back
      </Link>
    </main>
  );
}

