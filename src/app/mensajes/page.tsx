"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
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

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  if (sessionStatus === "unauthenticated") {
    return null;
  }

  const conversations = data?.conversations ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="font-heading text-2xl text-primary">
            Mensajes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading || sessionStatus === "loading" ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tienes conversaciones todavía. Explora el{" "}
              <Link href="/mapa" className="font-medium text-accent underline underline-offset-2">
                mapa de ayuda
              </Link>{" "}
              y contacta una ficha para empezar.
            </p>
          ) : (
            <ul className="grid gap-2" data-testid="conversation-list">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <Link
                    href={`/mensajes/${conversation.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-accent/40 hover:bg-accent/[0.03] hover:shadow-sm"
                  >
                    <div className="grid gap-1">
                      <span className="font-heading font-medium text-foreground">
                        {conversation.otherName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Ficha: {conversation.listing.title}
                      </span>
                      {conversation.lastMessage && (
                        <span className="line-clamp-1 text-sm text-muted-foreground">
                          {conversation.lastMessage}
                        </span>
                      )}
                    </div>
                    {conversation.unreadCount > 0 && (
                      <Badge
                        data-testid="unread-badge"
                        className="shrink-0 bg-accent text-accent-foreground hover:bg-accent"
                      >
                        {conversation.unreadCount}
                      </Badge>
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
