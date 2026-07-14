import { goodsPlans, servicePlans } from "@/lib/data/plans";
import type { Plan } from "@/lib/types";

export async function getPlans(type: "goods" | "services"): Promise<Plan[]> {
  return type === "goods" ? goodsPlans : servicePlans;
}

// Sync lookup of a single plan by kind + id. Plans are code-defined, so
// this is a pure array find — handy in server actions (e.g. resolving a
// plan's set-up fee at approval time) where an await isn't warranted.
export function getPlan(type: "goods" | "services", id: string): Plan | undefined {
  return (type === "goods" ? goodsPlans : servicePlans).find((p) => p.id === id);
}
