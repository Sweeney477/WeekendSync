"use client";

export function InviteButton({ inviteCode }: { inviteCode: string }) {
  const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${inviteCode}`;

  const handleInvite = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join my trip on WeekendSync",
          url: inviteLink,
        });
      } else {
        await navigator.clipboard.writeText(inviteLink);
        alert("Invite link copied to clipboard!");
      }
    } catch (err) {
      // User cancelled share or error occurred
      if (err instanceof Error && err.name !== "AbortError") {
        // Fallback to clipboard if share fails (not user cancellation)
        try {
          await navigator.clipboard.writeText(inviteLink);
          alert("Invite link copied to clipboard!");
        } catch {
          alert("Failed to share invite link");
        }
      }
    }
  };

  return (
    <button
      onClick={handleInvite}
      className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 font-bold text-white shadow-lg active:scale-[0.98]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" x2="19" y1="8" y2="14" />
        <line x1="22" x2="16" y1="11" y2="11" />
      </svg>
      Invite More Friends
    </button>
  );
}
