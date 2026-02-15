"use client";

import { useEffect, useState } from "react";
import { AppFooterNav } from "./AppFooterNav";

type MeResponse = {
  user: { id: string; email?: string | null } | null;
  profile?: { id: string; display_name: string; home_city: string | null } | null;
};

import { WhatsNewModal } from "./discovery/WhatsNewModal";

export function AppFooterNavWrapper() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : null)
      .then((data: MeResponse | null) => setIsAuthed(!!data?.user))
      .catch(() => setIsAuthed(false));
  }, []);

  return (
    <>
      <AppFooterNav isAuthed={isAuthed} />
      <WhatsNewModal />
    </>
  );
}
