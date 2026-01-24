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
    .select(`
      role,
      joined_at,
      user_id,
      profiles (
        id,
        display_name
      )
    `)
    .eq("trip_id", tripId);

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
    <div className="flex flex-col gap-6 px-4 pb-24 pt-4">
      <Card className="flex flex-col gap-4 rounded-3xl border-none bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">Group Status</span>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-bold text-brand-600">
            {submittedCount}/{totalMembers} Joined
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-bold text-slate-900">
            Availability submitted by {submittedCount}/{totalMembers} friends
          </p>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-brand-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
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
            ? "Almost there! Waiting on a few more friends."
            : "Everyone is in! Time to move to the next phase."}
        </div>
      </Card>

      <div className="relative overflow-hidden rounded-[32px] bg-slate-900 shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop"
          alt="Mountains"
          className="h-48 w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent p-6">
          <h2 className="text-xl font-bold text-white">Next Step: {nextStepTitle}</h2>
          <p className="mt-1 text-sm text-slate-300">{nextStepDesc}</p>
          <Link
            href={nextStepHref}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 font-bold text-white shadow-lg transition-all active:scale-[0.98]"
          >
            Continue Planning
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
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
      </div>

      {topWeekendDisplay || topDestinationData ? (
        <div className="grid grid-cols-2 gap-4">
          {topWeekendDisplay && (
            <Card className="flex flex-col gap-3 rounded-[24px] border-none bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
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
                <span className="text-sm font-bold text-slate-900">{topWeekendDisplay}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Top Weekend</span>
              </div>
            </Card>
          )}

          {topDestinationData && (
            <Card className="flex flex-col gap-3 rounded-[24px] border-none bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-500">
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
                <span className="text-sm font-bold text-slate-900">
                  {topDestinationData.city_name}
                  {topDestinationData.country_code ? `, ${topDestinationData.country_code}` : ""}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">Top Destination</span>
              </div>
            </Card>
          )}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Planning Squad</h2>
          <span className="text-xs font-bold text-cyan-500">{totalMembers} total</span>
        </div>
        <div className="flex flex-col gap-3">
          {members?.map((member: any) => {
            // Skip members without profiles
            if (!member.profiles) return null;
            
            const hasSubmitted = usersWhoSubmitted.has(member.profiles.id);
            const isCurrentUser = member.user_id === user.id;
            return (
              <div key={member.profiles.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-600">
                    {member.profiles.display_name?.[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">
                      {member.profiles.display_name} {isCurrentUser ? "(You)" : ""}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {member.role === "organizer" ? "Organizer" : hasSubmitted ? "Submitted availability" : "Pending response"}
                    </span>
                  </div>
                </div>
                {hasSubmitted ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
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
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
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

