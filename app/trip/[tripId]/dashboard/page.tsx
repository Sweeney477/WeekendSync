import { Card } from "@/components/ui/Card";
import { requireTripMember } from "@/lib/auth/server";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { InviteButton } from "./invite-button";

export default async function TripDashboardPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { user, supabase } = await requireTripMember(tripId, { allowCookieWrites: false });

  // 1. Fetch Trip details
  const { data: trip } = await supabase
    .from("trips")
    .select("name, status, invite_code")
    .eq("id", tripId)
    .single();

  // 2. Fetch Members and their status
  const { data: members } = await supabase
    .from("trip_members")
    .select("role, joined_at, user_id")
    .eq("trip_id", tripId);

  const memberIds = (members ?? []).map((m) => m.user_id).filter(Boolean);
  const { data: profiles } = memberIds.length
    ? await supabase
        .from("public_profiles")
        .select("id, display_name")
        .in("id", memberIds)
    : { data: [] as Array<{ id: string; display_name: string }> };

  const profileMap = new Map<string, { id: string; displayName: string }>();
  for (const profile of profiles ?? []) {
    profileMap.set(profile.id as string, {
      id: profile.id as string,
      displayName: (profile.display_name as string) || "Unknown",
    });
  }

  // 3. Fetch Availability counts
  const { data: availability } = await supabase
    .from("availability")
    .select("user_id")
    .eq("trip_id", tripId);

  // 4. Fetch top weekend (by score)
  const { data: topWeekendData } = await supabase
    .from("weekend_options")
    .select("weekend_start, weekend_end, score")
    .eq("trip_id", tripId)
    .order("score", { ascending: false })
    .order("weekend_start", { ascending: true })
    .limit(1)
    .maybeSingle();

  // 5. Fetch top destination (by rank_score)
  const { data: topDestinationData } = await supabase
    .from("destination_options")
    .select("id, city_name, country_code, rank_score")
    .eq("trip_id", tripId)
    .order("rank_score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const usersWhoSubmitted = new Set(availability?.map((a) => a.user_id) ?? []);
  const totalMembers = members?.length ?? 0;
  const submittedCount = usersWhoSubmitted.size;
  const progress = totalMembers > 0 ? (submittedCount / totalMembers) * 100 : 0;

  // 6. Determine next step
  let nextStepTitle = "Mark Your Availability";
  let nextStepDesc = "Let the group know when you can make it!";
  let nextStepHref = `/trip/${tripId}/availability`;

  if (submittedCount >= totalMembers && totalMembers > 0) {
    nextStepTitle = "Pick a Weekend";
    nextStepDesc = "Everyone's availability is in. Let's find the winning dates!";
    nextStepHref = `/trip/${tripId}/weekends`;
  }

  // Format top weekend date
  let topWeekendDisplay = null;
  if (topWeekendData?.weekend_start && topWeekendData?.weekend_end) {
    try {
      const start = parseISO(topWeekendData.weekend_start);
      const end = parseISO(topWeekendData.weekend_end);
      topWeekendDisplay = `${format(start, "MMM dd")}–${format(end, "dd")}`;
    } catch {
      // Invalid date, skip
    }
  }

  return (
    <div className="flex flex-col gap-8 px-4 pb-24 pt-4">
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-white">Group Status</span>
          <span className="border-2 border-black bg-poster-yellow px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-black">
            {submittedCount}/{totalMembers} Joined
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-sans text-sm font-bold text-black dark:text-white">
            Availability submitted by {submittedCount}/{totalMembers} friends
          </p>
          <div className="h-4 w-full border-2 border-black bg-white p-0.5 dark:border-white dark:bg-zinc-900">
            <div
              className="h-full bg-poster-green transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <div className="flex h-5 w-5 items-center justify-center border-2 border-black bg-poster-blue text-white dark:border-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="16" y2="12" />
              <line x1="12" x2="12" y1="8" y2="8" />
            </svg>
          </div>
          {submittedCount < totalMembers
            ? "Waiting on friends"
            : "Everyone is in!"}
        </div>
      </Card>

      <div className="relative flex flex-col justify-end border-4 border-black bg-poster-blue p-6 shadow-[8px_8px_0px_0px_#000] dark:border-white dark:shadow-[8px_8px_0px_0px_#fff]">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tighter text-white">Next Step:<br />{nextStepTitle}</h2>
          <p className="font-sans text-sm font-medium text-white/90">{nextStepDesc}</p>
        </div>
        <Link
          href={nextStepHref}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 border-2 border-black bg-poster-yellow font-display text-lg font-bold uppercase tracking-widest text-black transition-all hover:bg-white hover:text-black active:translate-y-1"
        >
          Continue
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
            <line x1="5" x2="19" y1="12" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>

      {topWeekendDisplay || topDestinationData ? (
        <div className="grid grid-cols-2 gap-4">
          {topWeekendDisplay && (
            <Card className="flex flex-col gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-poster-yellow text-black dark:border-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-sm font-bold text-black dark:text-white">{topWeekendDisplay}</span>
                <span className="font-display text-[10px] font-bold uppercase tracking-widest text-slate-500">Top Weekend</span>
              </div>
            </Card>
          )}

          {topDestinationData && (
            <Card className="flex flex-col gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-poster-blue text-white dark:border-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-sm font-bold text-black dark:text-white">
                  {topDestinationData.city_name}
                </span>
                <span className="font-display text-[10px] font-bold uppercase tracking-widest text-slate-500">Top City</span>
              </div>
            </Card>
          )}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold uppercase tracking-wider text-black dark:text-white">Planning Squad</h2>
          <span className="font-display text-xs font-bold text-poster-blue">{totalMembers} total</span>
        </div>
        <div className="flex flex-col gap-3">
          {members?.map((member: any) => {
            const profile = profileMap.get(member.user_id as string);
            if (!profile) return null;

            const hasSubmitted = usersWhoSubmitted.has(profile.id);
            const isCurrentUser = profile.id === user.id;
            return (
              <div key={profile.id} className="flex items-center justify-between border-2 border-black bg-white p-3 dark:border-white dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-poster-orange font-display text-lg font-bold text-black dark:border-white">
                    {profile.displayName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-sm font-bold text-black dark:text-white">
                      {profile.displayName} {isCurrentUser ? "(You)" : ""}
                    </span>
                    <span className="font-display text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {member.role === "organizer" ? "Organizer" : hasSubmitted ? "Submitted" : "Pending"}
                    </span>
                  </div>
                </div>
                {hasSubmitted ? (
                  <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-poster-green text-black dark:border-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-slate-100 text-slate-300 dark:border-white dark:bg-zinc-800">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {trip?.invite_code && <InviteButton inviteCode={trip.invite_code} />}
    </div>
  );
}
