import type { Badge as BadgeType } from "@/lib/types";

export function Badge({ badge }: { badge: BadgeType }) {
  const classes =
    badge.variant === "terracotta"
      ? "bg-tr-p text-tr-d"
      : "bg-sg-p text-sg-d";

  return (
    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full ml-1 ${classes}`}>
      {badge.label}
    </span>
  );
}
