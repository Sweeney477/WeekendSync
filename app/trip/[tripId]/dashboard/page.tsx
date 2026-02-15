import { Card } from "@/components/ui/Card";
import { requireTripMember } from "@/lib/auth/server";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { InviteButton } from "./invite-button";
import { ITINERARY_TEMPLATES } from "@/lib/constants/itinerary-templates";
import { EmptyState } from "@/components/ui/EmptyState";
import { Tooltip } from "@/components/ui/Tooltip";
import { NextStepsCard } from "@/components/trip/NextStepsCard";

export default async function TripDashboardPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const { user, supabase } = await requireTripMember(tripId, { allowCookieWrites: false });

  // 1. Fetch Trip details (including guided/sports fields)
  const { data: trip } = await supabase
    .from("trips")
    .select("name, status, invite_code, weekend_type, selected_city, selected_event_id, selected_itinerary_template_id")
    .eq("id", tripId)
    .single();

  // 1b. Selected event (for sports dashboard)
  type SelectedEventRow = {
    id: string;
    title: string;
    start_time: string;
    venue: string | null;
    city: string | null;
    url: string | null;
  };
  let selectedEvent: SelectedEventRow | null = null;
  if (trip?.selected_event_id) {
    const { data: ev } = await supabase
      .from("events")
      .select("id, title, start_time, venue, city, url")
      .eq("id", trip.selected_event_id)
      .maybeSingle();
    const row = ev as SelectedEventRow | null;
    selectedEvent = row ?? null;
  }

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

  // Budget snapshot
  const { data: costs } = await supabase
    .from("trip_costs")
    .select("id, amount, currency")
    .eq("trip_id", tripId);
  const totalCost = (costs ?? []).reduce((sum, c) => sum + Number(c.amount), 0);
  const perPerson = totalMembers > 0 ? totalCost / totalMembers : 0;
  const template = trip?.selected_itinerary_template_id
    ? ITINERARY_TEMPLATES[trip.selected_itinerary_template_id]
    : null;
  type EventForMap = { venue: string | null; city: string | null };
  const eventForMap = selectedEvent as EventForMap | null;
  const mapQuery =
    eventForMap?.venue && (eventForMap.city ?? trip?.selected_city)
      ? encodeURIComponent(`${eventForMap.venue}, ${eventForMap.city ?? trip?.selected_city}`)
      : trip?.selected_city
        ? encodeURIComponent(trip.selected_city)
        : null;

  // Empty State Logic
  const showEmptyState = totalMembers <= 1;

  const UsersIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  return (
    <div className="flex flex-col gap-8 px-4 pb-24 pt-4">
      {showEmptyState && (
        <>
          <EmptyState
            icon={<UsersIcon />}
            title="Invite Your Squad"
            description="WeekendSync is built for groups. Invite friends to start voting on dates and destinations."
          />
          {trip?.invite_code && <InviteButton inviteCode={trip.invite_code} />}
        </>
      )}

      {!showEmptyState && (
        <Link href={`/trip/${tripId}/availability`} className="block transition-transform hover:scale-[1.01] active:scale-[0.99]">
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-white">Group Status</span>
                {/* Tooltip removed to avoid nested interactive elements, info is clear enough */}
              </div>
              <span className="border-2 border-black bg-poster-yellow px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-black">
                {submittedCount}/{totalMembers} Joined
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <p className="font-sans text-sm font-bold text-black dark:text-white">
                Availability submitted by {submittedCount}/{totalMembers} friends
              </p>
              <div className="h-4 w-full border-2 border-black bg-white p-0.5 dark:border-ink-dark/40 dark:bg-surface-dark-2">
                <div
                  className="h-full bg-poster-green transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-muted-dark">
              <div className="flex h-5 w-5 items-center justify-center border-2 border-black bg-poster-blue text-white dark:border-ink-dark/40">
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
        </Link>
      )}

      {selectedEvent && (
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-white">Selected Game</span>
            <Link
              href={`/trip/${tripId}/setup/games`}
              className="font-display text-xs font-bold uppercase tracking-widest text-poster-blue hover:underline"
            >
              Change game
            </Link>
          </div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wide text-black dark:text-ink-dark">
            {selectedEvent.title}
          </h3>
          {selectedEvent.start_time && (
            <p className="font-sans text-sm font-medium text-slate-600 dark:text-muted-dark">
              {format(parseISO(selectedEvent.start_time), "EEE, MMM d · h:mm a")}
            </p>
          )}
          {selectedEvent.venue && (
            <p className="font-sans text-sm text-slate-600 dark:text-muted-dark">
              {selectedEvent.venue}
              {selectedEvent.city ? ` · ${selectedEvent.city}` : ""}
            </p>
          )}
          {selectedEvent.url && (
            <a
              href={selectedEvent.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center border-2 border-black bg-poster-yellow font-display text-sm font-bold uppercase tracking-widest text-black hover:bg-poster-yellow/90 dark:border-ink-dark/40"
            >
              View tickets
            </a>
          )}
        </Card>
      )}

      {template && (
        <Link href={`/trip/${tripId}/plan`} className="block transition-transform hover:scale-[1.01] active:scale-[0.99]">
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-white">Weekend Itinerary</span>
            </div>
            <h3 className="font-display text-base font-bold uppercase tracking-wide text-black dark:text-ink-dark">
              {template.name}
            </h3>
            <ul className="list-inside list-disc font-sans text-sm text-slate-600 dark:text-muted-dark">
              {template.blocks.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </Card>
        </Link>
      )}

      {mapQuery && (
        <Card className="flex flex-col gap-3">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-white">Map</span>
          <p className="font-sans text-sm text-slate-600 dark:text-muted-dark">
            {selectedEvent
              ? [selectedEvent.venue, selectedEvent.city].filter(Boolean).join(" · ")
              : trip?.selected_city ?? ""}
          </p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center border-2 border-black bg-poster-blue font-display text-sm font-bold uppercase tracking-widest text-white hover:bg-poster-blue/90 dark:border-ink-dark/40"
          >
            Open in Maps
          </a>
        </Card>
      )}

      <NextStepsCard
        tripId={tripId}
        isOrganizer={user.id === (members?.find(m => m.role === "organizer")?.user_id ?? "")}
        memberCount={totalMembers}
        hasSubmittedAvailability={usersWhoSubmitted.has(user.id)}
        datesFinalized={!!topWeekendData} // Simplified check: if we have a top weekend, we consider it 'finalized' enough to move to planning, or we can add explicit trip.status check
        destinationFinalized={!!trip?.selected_city}
        hasLogistics={false} // We need to fetch this or pass it. For now, defaulting to false to show the step if others are done.
        hasItinerary={false} // Same.
        className=""
      />

      {topWeekendDisplay || topDestinationData ? (
        <div className="grid grid-cols-2 gap-4">
          {topWeekendDisplay && (
            <Link href={`/trip/${tripId}/weekends`} className="block transition-transform hover:scale-[1.01] active:scale-[0.99]">
              <Card className="flex flex-col gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-poster-yellow text-black dark:border-ink-dark/40">
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
                  <span className="font-display text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-muted-dark">Top Weekend</span>
                </div>
              </Card>
            </Link>
          )}

          {topDestinationData && (
            <Card className="flex flex-col gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-poster-blue text-white dark:border-ink-dark/40">
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
                <span className="font-display text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-muted-dark">Top City</span>
              </div>
            </Card>
          )}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold uppercase tracking-wider text-black dark:text-white">Planning Squad</h2>
            <Tooltip content="Everyone invited to this trip. Only organizers can change settings.">
              <button type="button" aria-label="Explain members" className="cursor-help rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 dark:bg-zinc-800 dark:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1">?</button>
            </Tooltip>
          </div>
          <span className="font-display text-xs font-bold text-poster-blue">{totalMembers} total</span>
        </div>
        <div className="flex flex-col gap-3">
          {members?.map((member: any) => {
            const profile = profileMap.get(member.user_id as string);
            if (!profile) return null;

            const hasSubmitted = usersWhoSubmitted.has(profile.id);
            const isCurrentUser = profile.id === user.id;
            return (
              <div key={profile.id} className="flex items-center justify-between border-2 border-black bg-white p-3 dark:border-ink-dark/40 dark:bg-surface-dark-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border-2 border-black bg-poster-orange font-display text-lg font-bold text-black dark:border-ink-dark/40">
                    {profile.displayName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans text-sm font-bold text-black dark:text-white">
                      {profile.displayName} {isCurrentUser ? "(You)" : ""}
                    </span>
                    <span className="font-display text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-muted-dark">
                      {member.role === "organizer" ? "Organizer" : hasSubmitted ? "Submitted" : "Pending"}
                    </span>
                  </div>
                </div>
                {hasSubmitted ? (
                  <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-poster-green text-black dark:border-ink-dark/40">
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
                  <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-slate-100 text-slate-300 dark:border-ink-dark/40 dark:bg-zinc-800">
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

      <Link href={`/trip/${tripId}/plan?tab=costs`} className="block transition-transform hover:scale-[1.01] active:scale-[0.99]">
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-black dark:text-white">Budget Snapshot</span>
            </div>
          </div>
          <p className="font-sans text-sm font-bold text-black dark:text-ink-dark">
            Total: ${totalCost.toFixed(2)} USD
          </p>
          {totalMembers > 0 && (
            <p className="font-sans text-xs text-slate-600 dark:text-muted-dark">
              ~${perPerson.toFixed(2)} per person
            </p>
          )}
        </Card>
      </Link>

      {!showEmptyState && trip?.invite_code && <InviteButton inviteCode={trip.invite_code} />}
    </div>
  );
}
