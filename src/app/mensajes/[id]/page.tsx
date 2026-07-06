"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportDialog } from "@/components/report-dialog";
import { fetchJson } from "@/lib/fetch-json";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  body: string;
  mine: boolean;
  createdAt: string;
}

interface ChatData {
  conversation: {
    id: string;
    listing: { id: string; title: string };
    otherName: string;
    otherUserId: string;
  };
  messages: ChatMessage[];
}

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, mutate } = useSWR<ChatData>(
    sessionStatus === "authenticated" ? `/api/conversations/${params.id}/messages` : null,
    fetchJson,
    { refreshInterval: 5_000 }
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages?.length]);

  if (sessionStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${params.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (!res.ok) {
        const errData = await res.json();
        toast.error(errData.error ?? "No se pudo enviar el mensaje");
        return;
      }
      setBody("");
      await mutate();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
      <div className="flex items-center justify-between gap-2 border-b pb-3">
        {isLoading || !data?.conversation ? (
          <Skeleton className="h-10 w-64" />
        ) : (
          <>
            <div className="grid gap-0.5">
              <span className="font-semibold" data-testid="chat-other-name">
                {data.conversation.otherName}
              </span>
              <Link
                href={`/ayuda/${data.conversation.listing.id}`}
                className="text-xs text-muted-foreground hover:underline"
              >
                Ficha: {data.conversation.listing.title}
              </Link>
            </div>
            <ReportDialog userId={data.conversation.otherUserId} />
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4" data-testid="chat-messages">
        {isLoading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-2/3" />
            ))}
          </div>
        ) : (
          <ul className="grid gap-2">
            {data?.messages?.map((m) => (
              <li
                key={m.id}
                className={cn("flex", m.mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                    m.mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-muted"
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <span
                    className={cn(
                      "mt-1 block text-[10px]",
                      m.mine ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {new Date(m.createdAt).toLocaleTimeString("es-VE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t pt-3">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe un mensaje..."
          maxLength={2000}
          data-testid="chat-input"
        />
        <Button type="submit" disabled={sending || !body.trim()} data-testid="chat-send">
          Enviar
        </Button>
      </form>
      <p className="pt-2 text-xs text-muted-foreground">
        Por tu seguridad, mantén la conversación dentro de la plataforma y no
        compartas datos bancarios.
      </p>
    </div>
  );
}
