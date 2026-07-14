import type { Plan } from "@/lib/types";

export const goodsPlans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: null,
    period: null,
    features: [
      "Up to 3 product listings",
      "CodaCo marketplace visibility",
      "Buyer messaging",
      "Basic analytics",
    ],
    popular: false,
    transactionFee: "5% per sale",
    targetType: "goods",
    billingType: "free",
  },
  {
    id: "standard",
    name: "Storefront",
    // One-time set-up fee, not a recurring subscription — `period: null`
    // renders the price as a bare "$28" with no "/month" suffix.
    price: 28,
    period: null,
    features: [
      "One-time set-up fee — no monthly cost",
      "Unlimited listings",
      "Customer reviews",
    ],
    popular: false,
    transactionFee: "5% per sale",
    targetType: "goods",
    billingType: "one_time",
    amountCents: 2800,
  },
];

export const servicePlanIncludes = [
  "Service profile",
  "Verified badge (pending CodaCo approval)",
  "CodaCo messaging",
  "Direct client payments through CodaCo",
  "Client reviews",
];

export const servicePlans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: null,
    period: null,
    trial: "Free for 3 months",
    features: [
      "Risk free trial with all of the features",
      "Then sign up for a monthly or annual plan",
    ],
    popular: false,
    transactionFee: "",
    targetType: "services",
    billingType: "free",
  },
  {
    id: "standard",
    name: "Monthly",
    price: 15,
    period: "month",
    features: ["Cancel any time"],
    popular: true,
    transactionFee: "",
    targetType: "services",
    billingType: "recurring",
    amountCents: 1400,
  },
  {
    id: "pro",
    name: "Annual",
    price: 160,
    period: "year",
    features: ["Save $20 vs. paying monthly", "Priority support"],
    popular: false,
    transactionFee: "",
    targetType: "services",
    billingType: "recurring",
    amountCents: 2900,
  },
];

// Compact price label for a plan card ("Free for 3 months", "$15/mo",
// "$160/yr"). Keeps the signup form and the standalone /plan page in sync.
export function planPriceLabel(plan: Plan): string {
  if (plan.trial) return plan.trial;
  if (plan.price == null) return "Free";
  const suffix = plan.period === "month" ? "/mo" : plan.period === "year" ? "/yr" : "";
  return `$${plan.price}${suffix}`;
}
