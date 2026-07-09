"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/reveal";
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
    <div className="bg-section-glow mx-auto w-full max-w-3xl px-4 py-12">
      <Reveal as="div">
        <Card className="overflow-hidden border-border/60 shadow-elevated">
          <div className="accent-rule h-0.5 w-full" aria-hidden />
          <CardHeader className="border-b border-border/40 pb-4">
            <CardTitle as="h1" className="font-display text-3xl font-semibold text-primary">
              Mensajes
            </CardTitle>
          </CardHeader>
        <CardContent className="pt-6">
          {isLoading || sessionStatus === "loading" ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="vta-skeleton h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 bg-card/50 p-8 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground">No tienes conversaciones todavía.</p>
              <p className="mt-1">
                Explora el{" "}
                <Link
                  href="/mapa"
                  className="font-medium text-accent underline underline-offset-2 link-underline"
                >
                  mapa de ayuda
                </Link>{" "}
                y contacta una ficha para empezar.
              </p>
            </div>
          ) : (
            <ul className="stagger-children grid gap-2" data-testid="conversation-list">
              {conversations.map((conversation) => (
                <Reveal as="li" key={conversation.id}>
                  <Link
                    href={`/mensajes/${conversation.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-soft hover-lift hover-glow"
                  >
                    <div className="grid gap-1">
                      <span className="font-display font-medium text-foreground">
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
                </Reveal>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      </Reveal>
    </div>
  );
}
