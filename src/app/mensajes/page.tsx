"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchJson } from "@/lib/fetch-json";

interface ConversationSummary {
  id: string;
  listing: { id: string; title: string; type: string };
  otherName: string;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

export default function MensajesPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const { data, isLoading } = useSWR<{ conversations: ConversationSummary[] }>(
    sessionStatus === "authenticated" ? "/api/conversations" : null,
    fetchJson,
    { refreshInterval: 15_000 }
  );

  if (sessionStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const conversations = data?.conversations ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Mensajes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || sessionStatus === "loading" ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tienes conversaciones todavía. Explora el{" "}
              <Link href="/mapa" className="underline">
                mapa de ayuda
              </Link>{" "}
              y contacta una ficha para empezar.
            </p>
          ) : (
            <ul className="grid gap-2" data-testid="conversation-list">
              {conversations.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/mensajes/${c.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
                  >
                    <div className="grid gap-1">
                      <span className="font-medium">{c.otherName}</span>
                      <span className="text-xs text-muted-foreground">
                        Ficha: {c.listing.title}
                      </span>
                      {c.lastMessage && (
                        <span className="text-sm text-muted-foreground">{c.lastMessage}</span>
                      )}
                    </div>
                    {c.unreadCount > 0 && (
                      <Badge data-testid="unread-badge">{c.unreadCount}</Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
