"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
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

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Friends</p>
          <h3 className="text-2xl font-black text-white">Squad</h3>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <input
            className="flex-1 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-sm text-white placeholder:text-white/40"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button size="sm" disabled={pending} onClick={sendRequest}>
            Send
          </Button>
        </div>
      </div>
      {loading ? (
        <p className="mt-6 text-sm text-white/60">Loading friends...</p>
      ) : (
        <div className="mt-6 space-y-6">
          <section>
            <h4 className="text-xs uppercase tracking-[0.3em] text-white/50">Friends</h4>
            {snapshot?.friends.length ? (
              <ul className="mt-3 space-y-3">
                {snapshot.friends.map((friend) => (
                  <li key={friend.friendshipId} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                    <div>
                      <p className="font-semibold">{friend.username}</p>
                      <p className="text-xs text-white/60">Lvl {friend.level} · {friend.title}</p>
                    </div>
                    <p className="text-xs text-white/50">ID: {friend.userId.slice(0, 6)}...</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-white/60">No friends yet.</p>
            )}
          </section>

          <section>
            <h4 className="text-xs uppercase tracking-[0.3em] text-white/50">Incoming requests</h4>
            {snapshot?.incoming.length ? (
              <ul className="mt-3 space-y-3">
                {snapshot.incoming.map((request) => (
                  <li key={request.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{request.username}</p>
                        <p className="text-xs text-white/60">{new Date(request.createdAt).toLocaleDateString()}</p>
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
                      <p className="mt-2 text-xs text-white/60">“{request.message}”</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-white/60">No incoming requests.</p>
            )}
          </section>

          <section>
            <h4 className="text-xs uppercase tracking-[0.3em] text-white/50">Outgoing requests</h4>
            {snapshot?.outgoing.length ? (
              <ul className="mt-3 space-y-3">
                {snapshot.outgoing.map((request) => (
                  <li key={request.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{request.username}</p>
                        <p className="text-xs text-white/60">{new Date(request.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-white/60">No outgoing requests.</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
