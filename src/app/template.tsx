import { TemplateShell } from "@/components/template-shell";

export default function Template({ children }: { children: React.ReactNode }) {
  return <TemplateShell>{children}</TemplateShell>;
}
