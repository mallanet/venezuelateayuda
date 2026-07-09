import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Heart } from "lucide-react";
import { DONATION_URL } from "@/lib/site";

type DonationLinkProps = ComponentPropsWithoutRef<"a"> & {
  showIcon?: boolean;
  children?: ReactNode;
};

/** Enlace externo a la campaña oficial en GoFundMe. */
export function DonationLink({
  className,
  showIcon = true,
  children = "Donar",
  ...props
}: DonationLinkProps) {
  return (
    <a
      href={DONATION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    >
      {showIcon && <Heart className="size-4" aria-hidden />}
      {children}
    </a>
  );
}
