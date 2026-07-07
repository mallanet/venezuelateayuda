"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReportDialog } from "@/components/report-dialog";
import { formatVeTime } from "@/lib/dates";
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

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  if (sessionStatus === "unauthenticated") {
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
        const errorBody = await res.json();
        toast.error(errorBody.error ?? "No se pudo enviar el mensaje");
        return;
      }
      setBody("");
      await mutate();
    } catch {
      toast.error("Error de conexión. Intenta de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-section-glow mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-4">
        {isLoading || !data?.conversation ? (
          <div className="vta-skeleton h-10 w-64 rounded-lg" />
        ) : (
          <>
            <div className="grid gap-0.5">
              <span
                className="font-display font-semibold text-foreground"
                data-testid="chat-other-name"
              >
                {data.conversation.otherName}
              </span>
              <Link
                href={`/ayuda/${data.conversation.listing.id}`}
                className="text-xs text-muted-foreground underline-offset-2 hover:text-accent hover:underline"
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
              <div key={i} className="vta-skeleton h-12 w-2/3 rounded-2xl" />
            ))}
          </div>
        ) : (
          <ul className="grid gap-3">
            {data?.messages?.map((message) => (
              <li
                key={message.id}
                className={cn("flex", message.mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-soft",
                    message.mine
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border border-border/60 bg-card"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.body}</p>
                  <span
                    className={cn(
                      "mt-1 block text-xs",
                      message.mine ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {formatVeTime(message.createdAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-border/40 pt-4">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe un mensaje..."
          maxLength={2000}
          data-testid="chat-input"
          className="rounded-xl border-border/60"
        />
        <Button
          type="submit"
          disabled={sending || !body.trim()}
          data-testid="chat-send"
          className="rounded-xl shadow-soft"
        >
          Enviar
        </Button>
      </form>
      <p className="pt-3 text-xs text-muted-foreground">
        Por tu seguridad, mantén la conversación dentro de la plataforma y no compartas datos
        bancarios.
      </p>
    </div>
  );
}
