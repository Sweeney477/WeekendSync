"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requestNotificationPermission, scheduleReminder } from "@/lib/notifications";
import { cacheTripData, getCachedTripData, syncQueue, isOnline, queueEdit } from "@/lib/offline";

type Tab = "overview" | "plan" | "people" | "costs";

type TripData = {
  id: string;
  name: string;
  inviteCode: string;
  inviteLink: string;
  createdAt: string;
  organizerId: string;
  privacy: "code" | "invite";
  emergencyContact?: string;
};

type Member = {
  userId: string;
  displayName: string;
  role: "organizer" | "member";
  status: "accepted" | "pending";
  joinedAt: string;
};

type PlanItem = {
  id: string;
  title: string;
  dateTime: string | null;
  locationText: string | null;
  notes: string | null;
  ownerId: string | null;
  reminderOffsetMinutes: number | null;
  createdAt: string;
};

type Cost = {
  id: string;
  label: string;
  amount: number;
  currency: string;
  payerId: string;
  splits: Array<{ userId: string; amount: number }>;
  settled: boolean;
  createdAt: string;
};

type Logistics = {
  lodging: Array<{ id: string; name: string; dates: string; ref: string | null }>;
  transport: Array<{ id: string; name: string; dates: string; ref: string | null }>;
};

export function PlanClient({ tripId, userRole }: { tripId: string; userRole: string }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<TripData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [costs, setCosts] = useState<Cost[]>([]);
  const [logistics, setLogistics] = useState<Logistics>({ lodging: [], transport: [] });
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(!isOnline());

  const isOrganizer = userRole === "organizer";

  // Monitor online/offline status

  const loadTripData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Try to load from cache first if offline
    if (!isOnline()) {
      const cached = getCachedTripData(tripId);
      if (cached) {
        setTrip(cached.trip);
        setMembers(cached.members || []);
        setPlanItems(cached.items || []);
        setCosts(cached.costs || []);
        setLogistics(cached.logistics || { lodging: [], transport: [] });
        setLoading(false);
        return;
      }
    }

    try {
      const [tripRes, membersRes, itemsRes, costsRes, logisticsRes] = await Promise.all([
        fetch(`/api/trip/${tripId}/plan`),
        fetch(`/api/trip/${tripId}/members`),
        fetch(`/api/trip/${tripId}/plan/items`),
        fetch(`/api/trip/${tripId}/costs`),
        fetch(`/api/trip/${tripId}/logistics`),
      ]);

      // Check for auth/not-found errors first - trip endpoint is required
      if (tripRes.status === 401 || tripRes.status === 403 || tripRes.status === 404) {
        const errorText = await tripRes.text();
        const friendlyMessage =
          tripRes.status === 404
            ? "Trip not found. Redirecting..."
            : "You don't have access to this trip. Redirecting...";
        console.error("Access error loading trip:", errorText);
        setError(friendlyMessage);
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
        return;
      }

      if (!tripRes.ok) {
        const errorText = await tripRes.text();
        throw new Error(errorText || `Failed to load trip (${tripRes.status})`);
      }

      // Parse all responses, but trip is required
      const tripData = await tripRes.json();
      if (!tripData?.trip) {
        throw new Error("Trip not found or invalid response");
      }

      // Set trip data (required)
      setTrip(tripData.trip);

      // Define variables in outer scope
      let membersData, itemsData, costsData, logisticsData;

      // Parse optional endpoints - continue even if some fail
      try {
        membersData = membersRes.ok ? await membersRes.json() : null;
        if (membersData?.members) {
          setMembers(membersData.members);
        } else if (!membersRes.ok && membersRes.status !== 404) {
          console.warn("Failed to load members:", membersRes.status);
        }
      } catch (err) {
        console.warn("Error parsing members data:", err);
      }

      try {
        itemsData = itemsRes.ok ? await itemsRes.json() : null;
        if (itemsData?.items) {
          setPlanItems(itemsData.items);
        } else if (!itemsRes.ok && itemsRes.status !== 404) {
          console.warn("Failed to load plan items:", itemsRes.status);
        }
      } catch (err) {
        console.warn("Error parsing plan items data:", err);
      }

      try {
        costsData = costsRes.ok ? await costsRes.json() : null;
        if (costsData?.costs) {
          setCosts(costsData.costs);
        } else if (!costsRes.ok && costsRes.status !== 404) {
          console.warn("Failed to load costs:", costsRes.status);
        }
      } catch (err) {
        console.warn("Error parsing costs data:", err);
      }

      try {
        logisticsData = logisticsRes.ok ? await logisticsRes.json() : null;
        if (logisticsData?.logistics) {
          setLogistics(logisticsData.logistics);
        } else if (!logisticsRes.ok && logisticsRes.status !== 404) {
          console.warn("Failed to load logistics:", logisticsRes.status);
        }
      } catch (err) {
        console.warn("Error parsing logistics data:", err);
      }

      // Cache the data
      cacheTripData(tripId, {
        trip: tripData?.trip,
        members: membersData?.members,
        items: itemsData?.items,
        costs: costsData?.costs,
        logistics: logisticsData?.logistics,
      });

      // Sync any queued edits
      if (isOnline()) {
        const synced = await syncQueue(tripId);
        if (synced > 0) {
          // Reload to get synced changes
          // Use recursion carefully or just let the next effect trigger if something changes?
          // Since loadTripData is in dependencies, we should probably JUST CALL IT?
          // No, loadTripData doesn't depend on sync status.
          await loadTripData();
        }
      }
    } catch (err) {
      console.error("Error loading trip data:", err);
      // If online and error, try cache
      if (isOnline()) {
        const cached = getCachedTripData(tripId);
        if (cached) {
          setTrip(cached.trip);
          setMembers(cached.members || []);
          setPlanItems(cached.items || []);
          setCosts(cached.costs || []);
          setLogistics(cached.logistics || { lodging: [], transport: [] });
        }
      }
      setError(err instanceof Error ? err.message : "Failed to load trip data");
    } finally {
      setLoading(false);
    }
  }, [tripId]);
  useEffect(() => {
    const handleOnline = () => {
      setOffline(false);
      // Try to sync queue when coming back online
      syncQueue(tripId).then((synced) => {
        if (synced > 0) {
          loadTripData();
        }
      });
    };
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [tripId, loadTripData]);

  useEffect(() => {
    loadTripData();
    // Request notification permission on mount
    requestNotificationPermission();
  }, [tripId, loadTripData]);

  // Schedule reminders for plan items
  useEffect(() => {
    planItems.forEach((item) => {
      if (item.dateTime && item.reminderOffsetMinutes) {
        scheduleReminder(item.id, item.title, item.dateTime, item.reminderOffsetMinutes);
      }
    });
  }, [planItems]);



  if (loading) {
    return (
      <div className="flex flex-col gap-6 px-4 pb-24">
        <div className="h-32 w-full animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 px-4 pb-24">
        <Card className="p-6">
          <p className="text-sm font-medium text-rose-500">{error}</p>
          <Button onClick={loadTripData} className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-24">
      {/* Offline Indicator */}
      {offline && (
        <div className="mx-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-center">
          <p className="text-xs font-bold text-amber-700">You&apos;re offline. Changes will sync when you&apos;re back online.</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="sticky top-[112px] z-40 flex gap-2 overflow-x-auto bg-slate-50 pb-2 pt-2">
        {[
          { key: "overview" as Tab, label: "Overview" },
          { key: "plan" as Tab, label: "Plan" },
          { key: "people" as Tab, label: "People" },
          { key: "costs" as Tab, label: "Costs" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${activeTab === tab.key
              ? "bg-brand-400 text-white"
              : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <OverviewTab
          trip={trip}
          members={members}
          logistics={logistics}
          isOrganizer={isOrganizer}
          onUpdate={loadTripData}
        />
      )}
      {activeTab === "plan" && (
        <PlanTab tripId={tripId} items={planItems} setItems={setPlanItems} members={members} onUpdate={loadTripData} />
      )}
      {activeTab === "people" && (
        <PeopleTab
          tripId={tripId}
          trip={trip}
          members={members}
          isOrganizer={isOrganizer}
          onUpdate={loadTripData}
        />
      )}
      {activeTab === "costs" && (
        <CostsTab tripId={tripId} costs={costs} members={members} onUpdate={loadTripData} />
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({
  trip,
  members,
  logistics,
  isOrganizer,
  onUpdate,
}: {
  trip: TripData | null;
  members: Member[];
  logistics: Logistics;
  isOrganizer: boolean;
  onUpdate: () => void;
}) {
  const [showPrivacyEdit, setShowPrivacyEdit] = useState(false);
  const [privacy, setPrivacy] = useState<"code" | "invite">(trip?.privacy || "code");
  const [emergencyContact, setEmergencyContact] = useState(trip?.emergencyContact || "");
  const [saving, setSaving] = useState(false);

  async function handleSavePrivacy() {
    if (!trip) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/trip/${trip.id}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy, emergencyContact }),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setShowPrivacyEdit(false);
      onUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Trip Summary */}
      <Card className="flex flex-col gap-4 rounded-3xl border-none bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Trip Summary</h2>
        </div>
        {trip && (
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trip Name</span>
              <p className="text-base font-bold text-slate-900">{trip.name}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trip Code</span>
              <div className="flex items-center gap-2">
                <p className="text-base font-bold tracking-widest text-slate-900">{trip.inviteCode}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(trip.inviteCode);
                    alert("Code copied!");
                  }}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Created</span>
              <p className="text-sm text-slate-600">
                {new Date(trip.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Members</span>
              <p className="text-sm font-bold text-slate-900">{members.length} people</p>
            </div>
          </div>
        )}
      </Card>

      {/* Privacy & Safety */}
      {isOrganizer && (
        <Card className="flex flex-col gap-4 rounded-3xl border-none bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Privacy & Safety</h2>
            {!showPrivacyEdit && (
              <button
                onClick={() => setShowPrivacyEdit(true)}
                className="text-sm font-bold text-brand-500"
              >
                Edit
              </button>
            )}
          </div>
          {showPrivacyEdit ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Privacy Mode</label>
                <select
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value as "code" | "invite")}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
                >
                  <option value="code">Code Only (anyone with code can join)</option>
                  <option value="invite">Invite Only (organizer approval required)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-600">Emergency Contact</label>
                <Input
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="Phone number or email"
                  className="h-12"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSavePrivacy} isLoading={saving} className="flex-1">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setShowPrivacyEdit(false);
                    setPrivacy(trip?.privacy || "code");
                    setEmergencyContact(trip?.emergencyContact || "");
                  }}
                  className="flex-1 bg-slate-200 text-slate-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-xs text-slate-500">Privacy:</span>
                <p className="text-sm font-bold text-slate-900">
                  {trip?.privacy === "code" ? "Code Only" : "Invite Only"}
                </p>
              </div>
              {trip?.emergencyContact && (
                <div>
                  <span className="text-xs text-slate-500">Emergency Contact:</span>
                  <p className="text-sm font-bold text-slate-900">{trip.emergencyContact}</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Quick Logistics */}
      <Card className="flex flex-col gap-4 rounded-3xl border-none bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Logistics</h2>
          <LogisticsForm tripId={trip?.id || ""} onUpdate={onUpdate} />
        </div>
        {logistics.lodging.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lodging</span>
            {logistics.lodging.map((item) => (
              <div key={item.id} className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-bold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.dates}</p>
                {item.ref && <p className="text-xs text-slate-400">Ref: {item.ref}</p>}
              </div>
            ))}
          </div>
        )}
        {logistics.transport.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Transport</span>
            {logistics.transport.map((item) => (
              <div key={item.id} className="rounded-xl bg-slate-50 p-3">
                <p className="text-sm font-bold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.dates}</p>
                {item.ref && <p className="text-xs text-slate-400">Ref: {item.ref}</p>}
              </div>
            ))}
          </div>
        )}
        {logistics.lodging.length === 0 && logistics.transport.length === 0 && (
          <p className="text-sm text-slate-500">No logistics added yet. Click the + button to add lodging or transport.</p>
        )}
      </Card>

      {/* Leave Trip */}
      {!isOrganizer && (
        <Card className="flex flex-col gap-4 rounded-3xl border-none bg-white p-6 shadow-sm">
          <Button
            onClick={async () => {
              if (!confirm("Are you sure you want to leave this trip?")) return;
              try {
                const res = await fetch(`/api/trip/${trip?.id}/leave`, { method: "POST" });
                if (!res.ok) throw new Error("Failed to leave trip");
                window.location.href = "/";
              } catch (err) {
                alert(err instanceof Error ? err.message : "Failed to leave trip");
              }
            }}
            className="bg-rose-500 text-white"
          >
            Leave Trip
          </Button>
        </Card>
      )}
    </div>
  );
}

// Plan Tab Component
function PlanTab({
  tripId,
  items,
  setItems,
  members,
  onUpdate,
}: {
  tripId: string;
  items: PlanItem[];
  setItems: (items: PlanItem[]) => void;
  members: Member[];
  onUpdate: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    dateTime: "",
    locationText: "",
    notes: "",
    ownerId: "",
    reminderOffsetMinutes: 60,
  });

  // Group items by date
  const itemsByDate = items.reduce((acc, item) => {
    const date = item.dateTime ? new Date(item.dateTime).toDateString() : "No Date";
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, PlanItem[]>);

  async function handleSave() {
    const url = editingId
      ? `/api/trip/${tripId}/plan/items/${editingId}`
      : `/api/trip/${tripId}/plan/items`;
    const method = editingId ? "PATCH" : "POST";
    const body = {
      title: formData.title,
      dateTime: formData.dateTime || null,
      locationText: formData.locationText || null,
      notes: formData.notes || null,
      ownerId: formData.ownerId || null,
      reminderOffsetMinutes: formData.reminderOffsetMinutes || null,
    };

    if (!isOnline()) {
      // Queue for later
      queueEdit({
        tripId,
        type: editingId ? "update_item" : "create_item",
        endpoint: url,
        method,
        body,
      });
      alert("Offline - changes will sync when you're back online");
      setShowAddForm(false);
      setEditingId(null);
      setFormData({
        title: "",
        dateTime: "",
        locationText: "",
        notes: "",
        ownerId: "",
        reminderOffsetMinutes: 60,
      });
      // Optimistically update UI
      if (!editingId) {
        setItems([
          ...items,
          {
            id: `temp-${Date.now()}`,
            title: body.title,
            dateTime: body.dateTime,
            locationText: body.locationText,
            notes: body.notes,
            ownerId: body.ownerId,
            reminderOffsetMinutes: body.reminderOffsetMinutes,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      return;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save item");
      setShowAddForm(false);
      setEditingId(null);
      setFormData({
        title: "",
        dateTime: "",
        locationText: "",
        notes: "",
        ownerId: "",
        reminderOffsetMinutes: 60,
      });
      onUpdate();
    } catch (err) {
      // If network error, queue it
      if (!isOnline() || (err instanceof Error && err.message.includes("fetch"))) {
        queueEdit({
          tripId,
          type: editingId ? "update_item" : "create_item",
          endpoint: url,
          method,
          body,
        });
        alert("Network error - changes queued for sync");
      } else {
        alert(err instanceof Error ? err.message : "Failed to save");
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(`/api/trip/${tripId}/plan/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      onUpdate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Itinerary</h2>
        <Button onClick={() => setShowAddForm(true)} className="h-10">
          + Add Item
        </Button>
      </div>

      {showAddForm && (
        <Card className="flex flex-col gap-4 rounded-3xl border-none bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-900">{editingId ? "Edit Item" : "New Item"}</h3>
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Activity or task name"
            required
          />
          <Input
            label="Date & Time"
            type="datetime-local"
            value={formData.dateTime}
            onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
          />
          <Input
            label="Location"
            value={formData.locationText}
            onChange={(e) => setFormData({ ...formData, locationText: e.target.value })}
            placeholder="Address or place name"
          />
          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional details"
          />
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600">Assigned To</label>
            <select
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600">Reminder (minutes before)</label>
            <Input
              type="number"
              value={formData.reminderOffsetMinutes}
              onChange={(e) =>
                setFormData({ ...formData, reminderOffsetMinutes: parseInt(e.target.value) || 0 })
              }
              min={0}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
            <Button
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
                setFormData({
                  title: "",
                  dateTime: "",
                  locationText: "",
                  notes: "",
                  ownerId: "",
                  reminderOffsetMinutes: 60,
                });
              }}
              className="flex-1 bg-slate-200 text-slate-700"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {Object.keys(itemsByDate).length === 0 ? (
        <Card className="flex flex-col items-center gap-4 rounded-3xl border-none bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">No items yet. Add your first activity!</p>
        </Card>
      ) : (
        Object.entries(itemsByDate).map(([date, dateItems]) => (
          <Card key={date} className="flex flex-col gap-3 rounded-3xl border-none bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">{date}</h3>
            {dateItems.map((item) => {
              const owner = members.find((m) => m.userId === item.ownerId);
              return (
                <div key={item.id} className="flex items-start justify-between rounded-xl bg-slate-50 p-3">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{item.title}</p>
                    {item.dateTime && (
                      <p className="text-xs text-slate-500">
                        {new Date(item.dateTime).toLocaleString()}
                      </p>
                    )}
                    {item.locationText && (
                      <p className="text-xs text-slate-500">📍 {item.locationText}</p>
                    )}
                    {owner && (
                      <p className="text-xs text-slate-400">Assigned to {owner.displayName}</p>
                    )}
                    {item.notes && <p className="mt-1 text-xs text-slate-600">{item.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setFormData({
                          title: item.title,
                          dateTime: item.dateTime
                            ? new Date(item.dateTime).toISOString().slice(0, 16)
                            : "",
                          locationText: item.locationText || "",
                          notes: item.notes || "",
                          ownerId: item.ownerId || "",
                          reminderOffsetMinutes: item.reminderOffsetMinutes || 60,
                        });
                        setShowAddForm(true);
                      }}
                      className="text-xs font-bold text-brand-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs font-bold text-rose-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </Card>
        ))
      )}
    </div>
  );
}

// People Tab Component
function PeopleTab({
  tripId,
  trip,
  members,
  isOrganizer,
  onUpdate,
}: {
  tripId: string;
  trip: TripData | null;
  members: Member[];
  isOrganizer: boolean;
  onUpdate: () => void;
}) {
  const inviteCode = trip?.inviteCode ?? "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const inviteLink = trip?.inviteLink ?? (inviteCode ? `${origin}/join/${inviteCode}` : "");
  const inviteMessage = inviteLink
    ? `Join my WeekendSync trip${trip?.name ? `: ${trip.name}` : ""}\n\nTrip code: ${inviteCode}\nInvite link: ${inviteLink}`
    : "";

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Join my trip on WeekendSync",
          url: inviteLink,
        });
        // Show notification when shared
        requestNotificationPermission().then((granted) => {
          if (granted) {
            import("@/lib/notifications").then(({ showNotification }) => {
              showNotification("Invite shared!", {
                body: "Your friends can now join the trip using the link.",
              });
            });
          }
        });
      } else {
        await navigator.clipboard.writeText(inviteLink);
        alert("Invite link copied!");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        await navigator.clipboard.writeText(inviteLink);
        alert("Link copied!");
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4 rounded-3xl border-none bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Invite Friends</h2>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400">Trip Code</p>
              <p className="text-base font-bold tracking-widest text-slate-900">{inviteCode || "—"}</p>
            </div>
            <button
              onClick={() => {
                if (!inviteCode) return;
                navigator.clipboard.writeText(inviteCode);
                alert("Code copied!");
              }}
              className="rounded-lg bg-brand-100 px-3 py-1.5 text-xs font-bold text-brand-600"
            >
              Copy
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-400">Invite Link</p>
              <p className="truncate text-sm font-medium text-slate-700">{inviteLink || "—"}</p>
            </div>
            <button
              onClick={async () => {
                if (!inviteLink) return;
                try {
                  await navigator.clipboard.writeText(inviteLink);
                  alert("Invite link copied!");
                } catch {
                  alert("Couldn't copy automatically — try Share instead.");
                }
              }}
              className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700"
            >
              Copy
            </button>
          </div>

          <Button onClick={handleShare} className="h-12" disabled={!inviteLink}>
            Share Invite Link
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={
                inviteLink
                  ? `mailto:?subject=${encodeURIComponent("Join my WeekendSync trip")}&body=${encodeURIComponent(inviteMessage)}`
                  : undefined
              }
              aria-disabled={!inviteLink}
              className={`flex h-11 items-center justify-center rounded-2xl text-sm font-bold ${
                inviteLink ? "bg-slate-900 text-white active:scale-[0.98]" : "pointer-events-none bg-slate-100 text-slate-400"
              }`}
            >
              Email
            </a>
            <a
              href={inviteLink ? `sms:?&body=${encodeURIComponent(inviteMessage)}` : undefined}
              aria-disabled={!inviteLink}
              className={`flex h-11 items-center justify-center rounded-2xl text-sm font-bold ${
                inviteLink ? "bg-slate-900 text-white active:scale-[0.98]" : "pointer-events-none bg-slate-100 text-slate-400"
              }`}
            >
              Text
            </a>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 rounded-3xl border-none bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Members</h2>
          <span className="text-xs font-bold text-slate-400">{members.length} total</span>
        </div>
        <div className="flex flex-col gap-3">
          {members.map((member) => (
            <div key={member.userId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-600">
                  {member.displayName[0].toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{member.displayName}</span>
                  <span className="text-xs text-slate-500">
                    {member.role === "organizer" ? "Organizer" : "Member"}
                  </span>
                </div>
              </div>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${member.status === "accepted"
                  ? "bg-emerald-500"
                  : "bg-slate-200"
                  }`}
              >
                {member.status === "accepted" && (
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
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Logistics Form Component
function LogisticsForm({ tripId, onUpdate }: { tripId: string; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "lodging" as "lodging" | "transport",
    name: "",
    dates: "",
    ref: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!formData.name || !formData.dates) {
      alert("Please fill in name and dates");
      return;
    }
    setSaving(true);
    const body = {
      type: formData.type,
      name: formData.name,
      dates: formData.dates,
      ref: formData.ref || null,
    };

    if (!isOnline()) {
      queueEdit({
        tripId,
        type: "create_logistics",
        endpoint: `/api/trip/${tripId}/logistics`,
        method: "POST",
        body,
      });
      alert("Offline - changes will sync when you're back online");
      setShowForm(false);
      setFormData({ type: "lodging", name: "", dates: "", ref: "" });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/trip/${tripId}/logistics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      setShowForm(false);
      setFormData({ type: "lodging", name: "", dates: "", ref: "" });
      onUpdate();
    } catch (err) {
      if (!isOnline() || (err instanceof Error && err.message.includes("fetch"))) {
        queueEdit({
          tripId,
          type: "create_logistics",
          endpoint: `/api/trip/${tripId}/logistics`,
          method: "POST",
          body,
        });
        alert("Network error - changes queued for sync");
      } else {
        alert(err instanceof Error ? err.message : "Failed to save");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-400 text-white"
      >
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
          <line x1="12" x2="12" y1="5" y2="19" />
          <line x1="5" x2="19" y1="12" y2="12" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Card className="flex w-full max-w-md flex-col gap-4 rounded-3xl border-none bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">Add Logistics</h3>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-600">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as "lodging" | "transport" })}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
          >
            <option value="lodging">Lodging</option>
            <option value="transport">Transport</option>
          </select>
        </div>
        <Input
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Hotel ABC, Flight AA123"
          required
        />
        <Input
          label="Dates"
          value={formData.dates}
          onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
          placeholder="e.g. June 15-18, 2025"
          required
        />
        <Input
          label="Reference (optional)"
          value={formData.ref}
          onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
          placeholder="Confirmation code, booking ref, etc."
        />
        <div className="flex gap-2">
          <Button onClick={handleSave} isLoading={saving} className="flex-1">
            Save
          </Button>
          <Button
            onClick={() => {
              setShowForm(false);
              setFormData({ type: "lodging", name: "", dates: "", ref: "" });
            }}
            className="flex-1 bg-slate-200 text-slate-700"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Costs Tab Component
function CostsTab({
  tripId,
  costs,
  members,
  onUpdate,
}: {
  tripId: string;
  costs: Cost[];
  members: Member[];
  onUpdate: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    amount: "",
    currency: "USD",
    payerId: "",
    splitEqually: true,
    customSplits: {} as Record<string, number>,
  });

  // Calculate balances
  const balances = members.reduce((acc, member) => {
    let paid = 0;
    let owes = 0;
    costs.forEach((cost) => {
      if (cost.payerId === member.userId) paid += cost.amount;
      const split = cost.splits.find((s) => s.userId === member.userId);
      if (split) owes += split.amount;
    });
    acc[member.userId] = { paid, owes, balance: paid - owes };
    return acc;
  }, {} as Record<string, { paid: number; owes: number; balance: number }>);

  async function handleSave() {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount");
      return;
    }

    const splits = formData.splitEqually
      ? members.map((m) => ({ userId: m.userId, amount: amount / members.length }))
      : Object.entries(formData.customSplits).map(([userId, amt]) => ({
        userId,
        amount: amt,
      }));

    const body = {
      label: formData.label,
      amount,
      currency: formData.currency,
      payerId: formData.payerId,
      splits,
    };

    if (!isOnline()) {
      queueEdit({
        tripId,
        type: "create_cost",
        endpoint: `/api/trip/${tripId}/costs`,
        method: "POST",
        body,
      });
      alert("Offline - changes will sync when you're back online");
      setShowAddForm(false);
      setFormData({
        label: "",
        amount: "",
        currency: "USD",
        payerId: "",
        splitEqually: true,
        customSplits: {},
      });
      return;
    }

    try {
      const res = await fetch(`/api/trip/${tripId}/costs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save cost");
      setShowAddForm(false);
      setFormData({
        label: "",
        amount: "",
        currency: "USD",
        payerId: "",
        splitEqually: true,
        customSplits: {},
      });
      onUpdate();
    } catch (err) {
      if (!isOnline() || (err instanceof Error && err.message.includes("fetch"))) {
        queueEdit({
          tripId,
          type: "create_cost",
          endpoint: `/api/trip/${tripId}/costs`,
          method: "POST",
          body,
        });
        alert("Network error - changes queued for sync");
      } else {
        alert(err instanceof Error ? err.message : "Failed to save");
      }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Costs</h2>
        <Button onClick={() => setShowAddForm(true)} className="h-10">
          + Add Cost
        </Button>
      </div>

      {showAddForm && (
        <Card className="flex flex-col gap-4 rounded-3xl border-none bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-900">New Cost</h3>
          <Input
            label="Description"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            placeholder="e.g. Hotel, Flights"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-600">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-600">Paid By</label>
            <select
              value={formData.payerId}
              onChange={(e) => setFormData({ ...formData, payerId: e.target.value })}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
              required
            >
              <option value="">Select...</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.splitEqually}
                onChange={(e) =>
                  setFormData({ ...formData, splitEqually: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-xs font-bold text-slate-600">Split equally</span>
            </label>
            {!formData.splitEqually && (
              <div className="flex flex-col gap-2">
                {members.map((member) => (
                  <div key={member.userId} className="flex items-center gap-2">
                    <label className="flex-1 text-xs text-slate-600">{member.displayName}</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.customSplits[member.userId] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customSplits: {
                            ...formData.customSplits,
                            [member.userId]: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                      placeholder="0.00"
                      className="h-10 w-24"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save
            </Button>
            <Button
              onClick={() => {
                setShowAddForm(false);
                setFormData({
                  label: "",
                  amount: "",
                  currency: "USD",
                  payerId: "",
                  splitEqually: true,
                  customSplits: {},
                });
              }}
              className="flex-1 bg-slate-200 text-slate-700"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Cost List */}
      {costs.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 rounded-3xl border-none bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-500">No costs yet. Add your first expense!</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {costs.map((cost) => {
            const payer = members.find((m) => m.userId === cost.payerId);
            return (
              <Card
                key={cost.id}
                className="flex flex-col gap-2 rounded-3xl border-none bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{cost.label}</p>
                    <p className="text-sm text-slate-600">
                      {cost.currency} {cost.amount.toFixed(2)}
                    </p>
                    {payer && <p className="text-xs text-slate-500">Paid by {payer.displayName}</p>}
                  </div>
                  {cost.settled && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Balance Summary */}
      {costs.length > 0 && (
        <Card className="flex flex-col gap-3 rounded-3xl border-none bg-white p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Balances</h3>
          {members.map((member) => {
            const balance = balances[member.userId];
            if (!balance) return null;
            return (
              <div key={member.userId} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{member.displayName}</span>
                <span
                  className={`text-sm font-bold ${balance.balance > 0
                    ? "text-emerald-600"
                    : balance.balance < 0
                      ? "text-rose-600"
                      : "text-slate-600"
                    }`}
                >
                  {balance.balance > 0 ? "+" : ""}
                  {balance.balance.toFixed(2)}
                </span>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
