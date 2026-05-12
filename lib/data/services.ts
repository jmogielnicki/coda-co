import type { Service } from "@/lib/types";

export const services: Service[] = [
  // Maria Rosales — solo doula
  {
    id: "svc-mr-eol",
    vendorId: "maria-rosales",
    serviceType: "doula",
    title: "End-of-life doula support",
    description:
      "Home-centered dying support: advance care planning, bedside companionship, and family coaching through the active phase of dying.",
    locationType: "both",
    pricingModel: "hourly",
    price: 90,
    currency: "USD",
    status: "published",
  },
  {
    id: "svc-mr-acp",
    vendorId: "maria-rosales",
    serviceType: "doula",
    title: "Advance care planning sessions",
    description:
      "One or two sessions to document healthcare wishes, name a proxy, and have the conversations most families put off.",
    locationType: "virtual",
    pricingModel: "fixed",
    price: 220,
    currency: "USD",
    status: "published",
  },
  // Threshold Wellness — collective
  {
    id: "svc-tw-vigil",
    vendorId: "threshold-wellness",
    serviceType: "doula",
    title: "Vigil sitting & active dying support",
    description:
      "Overnight or daytime presence at home, in a facility, or in hospital. Sliding scale.",
    locationType: "both",
    pricingModel: "hourly",
    currency: "USD",
    status: "published",
  },
  {
    id: "svc-tw-bereavement",
    vendorId: "threshold-wellness",
    serviceType: "doula",
    title: "Bereavement check-ins & group circles",
    description:
      "Six months of follow-up calls and visits after a death. Monthly group circles for grieving families at our Boulder studio.",
    locationType: "both",
    pricingModel: "quote",
    currency: "USD",
    status: "published",
  },
  // Jade Castillo — bilingual doula
  {
    id: "svc-jc-legacy",
    vendorId: "jade-castillo",
    serviceType: "doula",
    title: "Legacy work & life review",
    description:
      "Recorded life-review sessions in English or Spanish. We co-create something a family can hold onto.",
    locationType: "in_person",
    pricingModel: "hourly",
    price: 75,
    currency: "USD",
    status: "published",
  },
  // James Thornton — estate attorney
  {
    id: "svc-jt-wills",
    vendorId: "james-thornton",
    serviceType: "attorney",
    title: "Wills, trusts & advance directives",
    description:
      "Draft and review wills, living trusts, durable powers of attorney, and advance directives. Estate administration available.",
    locationType: "in_person",
    pricingModel: "fixed",
    price: 450,
    currency: "USD",
    status: "published",
  },
  // Gentle Passage — home funerals (also sells shrouds)
  {
    id: "svc-gp-home-funeral",
    vendorId: "gentle-passage",
    serviceType: "home-funeral",
    title: "Home funeral guidance",
    description:
      "Family support for home vigils, ceremonial bathing, and natural burial preparation in Vermont and the surrounding region.",
    locationType: "in_person",
    pricingModel: "quote",
    currency: "USD",
    status: "published",
  },
  // Threshold Press — workshops alongside the workbooks
  {
    id: "svc-tp-workshops",
    vendorId: "threshold-press",
    serviceType: "organizer",
    title: "End-of-life planning workshops",
    description:
      "Virtual workshops walking individuals and couples through the planning workbook, with a hospice professional or attorney on call.",
    locationType: "virtual",
    pricingModel: "fixed",
    price: 95,
    currency: "USD",
    status: "published",
  },
  // Green Passage — celebrant
  {
    id: "svc-grp-celebrant",
    vendorId: "green-passage",
    serviceType: "celebrant",
    title: "Green burial celebrant services",
    description:
      "Officiating natural-burial and memorial services across Oregon. Family-led ceremonies welcomed.",
    locationType: "in_person",
    pricingModel: "quote",
    currency: "USD",
    status: "published",
  },
  // Sunlight Leaving — death cleaning
  {
    id: "svc-sl-cleanout",
    vendorId: "sunlight-leaving",
    serviceType: "cleaner",
    title: "Estate cleanouts & home transitions",
    description:
      "Trauma-informed sorting, clearing, and donation handling for families after a death. Hoarding-sensitive.",
    locationType: "in_person",
    pricingModel: "quote",
    currency: "USD",
    status: "published",
  },
  // Alma Park Celebrations
  {
    id: "svc-ap-memorial",
    vendorId: "alma-park-celebrations",
    serviceType: "celebrant",
    title: "Bilingual funeral & memorial ceremonies",
    description:
      "Memorial ceremonies crafted around the person you loved. English, Spanish, or both. Greater Denver and travels statewide.",
    locationType: "in_person",
    pricingModel: "quote",
    currency: "USD",
    status: "published",
  },
  // Front Range Death Café
  {
    id: "svc-frdc-cafe",
    vendorId: "front-range-death-cafe",
    serviceType: "cafe",
    title: "Monthly community death café",
    description:
      "Free, donation-based gatherings for open conversation about death. Second Sunday of every month at rotating Boulder cafés.",
    locationType: "in_person",
    pricingModel: "quote",
    currency: "USD",
    status: "published",
  },
  // Denver Death Café Collective
  {
    id: "svc-ddc-cafe",
    vendorId: "denver-death-cafe-collective",
    serviceType: "cafe",
    title: "In-person & virtual death cafés",
    description:
      "Volunteer-run cafés welcoming all backgrounds. Quarterly Spanish-language sessions. Suggested $0–$10 donation.",
    locationType: "both",
    pricingModel: "quote",
    currency: "USD",
    status: "published",
  },
  // Willow Grief Therapy
  {
    id: "svc-wgt-individual",
    vendorId: "willow-grief-therapy",
    serviceType: "grief",
    title: "Individual grief counseling",
    description:
      "Sessions with Dr. Hana Whitmore for complicated, anticipatory, and perinatal grief. Sliding scale available.",
    locationType: "virtual",
    pricingModel: "fixed",
    price: 150,
    currency: "USD",
    status: "published",
  },
  {
    id: "svc-wgt-group",
    vendorId: "willow-grief-therapy",
    serviceType: "grief",
    title: "Grief support groups",
    description:
      "Small, facilitated grief groups meeting weekly. Loss-of-child and loss-of-partner cohorts run quarterly.",
    locationType: "virtual",
    pricingModel: "fixed",
    price: 60,
    currency: "USD",
    status: "published",
  },
  // Marcus Okafor
  {
    id: "svc-mo-telehealth",
    vendorId: "marcus-okafor-grief",
    serviceType: "grief",
    title: "Trauma-informed grief therapy",
    description:
      "Telehealth across Colorado. Adults navigating the loss of a parent or partner.",
    locationType: "virtual",
    pricingModel: "fixed",
    price: 175,
    currency: "USD",
    status: "published",
  },
  // Prairie Rest
  {
    id: "svc-pr-burial",
    vendorId: "prairie-rest-conservation",
    serviceType: "green-burial",
    title: "Conservation burial plots",
    description:
      "Burial in a 180-acre protected shortgrass prairie. No vaults, no embalming. Plot fees fund land stewardship in perpetuity.",
    locationType: "in_person",
    pricingModel: "fixed",
    price: 4500,
    currency: "USD",
    status: "published",
  },
  // Aspen Meadow
  {
    id: "svc-am-burial",
    vendorId: "aspen-meadow-natural-burial",
    serviceType: "green-burial",
    title: "Natural burial section plots",
    description:
      "Hybrid natural-burial section in an established community cemetery. Welcomes shrouded and biodegradable-casket burials.",
    locationType: "in_person",
    pricingModel: "fixed",
    price: 3200,
    currency: "USD",
    status: "published",
  },
];
