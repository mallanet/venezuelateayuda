"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ReportDialogProps {
  listingId?: string;
  userId?: string;
}

/** Diálogo para denunciar una ficha o un usuario ante el equipo de moderación. */
export function ReportDialog({ listingId, userId }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, listingId, userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo enviar la denuncia");
        return;
      }
      toast.success("Denuncia enviada. Nuestro equipo la revisará.");
      setOpen(false);
      setReason("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          Denunciar
        </Button>
      </DialogTrigger>
      <DialogContent className="z-[1300]">
        <DialogHeader>
          <DialogTitle>Denunciar</DialogTitle>
          <DialogDescription>
            Cuéntanos qué ocurre. Nuestro equipo de moderación revisará el caso
            y tomará las medidas necesarias.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="report-reason">Motivo</Label>
          <Textarea
            id="report-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe el problema (mínimo 10 caracteres)"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || reason.trim().length < 10}>
            {loading ? "Enviando..." : "Enviar denuncia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
