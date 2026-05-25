"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Inbox, SendHorizontal, UserPlus, Users, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

type FriendSummary = {
  friendshipId: number;
  userId: string;
  username: string;
  level: number;
  title: string;
};

type FriendRequestSummary = {
  id: number;
  username: string;
  message?: string | null;
  createdAt: string;
};

type FriendsSnapshot = {
  friends: FriendSummary[];
  incoming: FriendRequestSummary[];
  outgoing: FriendRequestSummary[];
};

export function FriendsPanel() {
  const [snapshot, setSnapshot] = useState<FriendsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string | null } | null>(null);
  const { push } = useToast();

  const loadFriends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/friends", { cache: "no-store" });
      if (!res.ok) throw new Error("Unable to load friends");
      const data = (await res.json()) as FriendsSnapshot;
      setSnapshot(data);
    } catch {
      push({ title: "Failed to load friends", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    void (async () => {
      await loadFriends();
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (meRes.ok) {
        const me = (await meRes.json()) as { user: { id: string; profile?: { username: string | null } | null } | null };
        if (me.user) {
          setCurrentUser({ id: me.user.id, username: me.user.profile?.username ?? null });
        }
      }
    })();
  }, [loadFriends]);

  function sendRequest() {
    if (!username.trim()) {
      push({ title: "Enter a username", variant: "error" });
      return;
    }
    if (currentUser && username.trim().toLowerCase() === (currentUser.username ?? "").toLowerCase()) {
      push({ title: "You cannot add yourself", variant: "error" });
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        let message = data.error ?? "Unable to send request";
        if (message.toLowerCase().includes("not found")) {
          message = "User not found";
        }
        push({ title: message, variant: "error" });
        return;
      }
      push({ title: "Friend request sent", variant: "success" });
      setUsername("");
      loadFriends();
    });
  }

  function respondRequest(id: number, action: "accept" | "reject") {
    startTransition(async () => {
      const res = await fetch(`/api/friends/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        push({ title: data.error ?? "Unable to respond", variant: "error" });
        return;
      }
      push({ title: `Request ${action}ed`, variant: "success" });
      loadFriends();
    });
  }

  const friends = snapshot?.friends ?? [];
  const incoming = snapshot?.incoming ?? [];
  const outgoing = snapshot?.outgoing ?? [];

  return (
    <div className="min-h-[520px] rounded-3xl border border-white/10 bg-[#0b0f18]/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.45fr] 2xl:grid-cols-[0.75fr_1.55fr]">
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-300/60">
                  Guild Hall
                </p>
                <h3 className="mt-2 text-3xl font-black leading-tight text-white">Squad</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-white/55">
                  Build your party and keep requests organized in one deck.
                </p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <StatTile label="Friends" value={friends.length} />
              <StatTile label="Incoming" value={incoming.length} />
              <StatTile label="Outgoing" value={outgoing.length} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/70">
                <UserPlus className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Add Friend</h4>
                <p className="text-xs text-white/45">Send an invite by username.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col 2xl:flex-row">
              <input
                className="min-h-11 flex-1 rounded-2xl border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-300/45 focus:bg-black/50"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Button size="sm" disabled={pending} onClick={sendRequest} className="min-h-11 px-5">
                <SendHorizontal className="h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </aside>

        {loading ? (
          <div className="grid min-h-[420px] place-items-center rounded-2xl border border-white/10 bg-white/[0.025]">
            <p className="text-sm text-white/60">Loading friends...</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <section className="flex min-h-[420px] flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <SectionHeader icon={Users} title="Friends" count={friends.length} />
              {friends.length ? (
                <ul className="mt-4 space-y-3">
                  {friends.map((friend) => (
                    <li key={friend.friendshipId} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{friend.username}</p>
                          <p className="text-xs text-white/55">Lvl {friend.level} - {friend.title}</p>
                        </div>
                        <p className="shrink-0 font-mono text-[10px] text-white/35">
                          {friend.userId.slice(0, 6)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState text="No friends yet." />
              )}
            </section>

            <section className="flex min-h-[420px] flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <SectionHeader icon={Inbox} title="Incoming" count={incoming.length} />
              {incoming.length ? (
                <ul className="mt-4 space-y-3">
                  {incoming.map((request) => (
                    <li key={request.id} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="font-semibold">{request.username}</p>
                          <p className="text-xs text-white/55">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="primary" disabled={pending} onClick={() => respondRequest(request.id, "accept")}>
                            Accept
                          </Button>
                          <Button size="sm" variant="ghost" disabled={pending} onClick={() => respondRequest(request.id, "reject")}>
                            Reject
                          </Button>
                        </div>
                      </div>
                      {request.message && (
                        <p className="mt-3 rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-white/60">
                          {request.message}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState text="No incoming requests." />
              )}
            </section>

            <section className="flex min-h-[420px] flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <SectionHeader icon={SendHorizontal} title="Outgoing" count={outgoing.length} />
              {outgoing.length ? (
                <ul className="mt-4 space-y-3">
                  {outgoing.map((request) => (
                    <li key={request.id} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white">
                      <p className="font-semibold">{request.username}</p>
                      <p className="text-xs text-white/55">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState text="No outgoing requests." />
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, count }: { icon: LucideIcon; title: string; count: number }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/60">
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="text-xs font-black uppercase tracking-[0.22em] text-white/70">{title}</h4>
      </div>
      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-white/45">
        {count}
      </span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-white/10 bg-black/10 p-6 text-center">
      <p className="text-sm text-white/45">{text}</p>
    </div>
  );
}
