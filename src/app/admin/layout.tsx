import type { ReactNode } from "react";

/** Shell propio del panel: sin depender del flujo /login público. */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
