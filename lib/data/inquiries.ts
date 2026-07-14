// Mock client→vendor inquiries for the dashboard Messages view. Sourced
// by prisma/mock.ts only (never imported at runtime). `vendorId` is the
// vendor slug; `read` maps to readAt (now vs. null) at seed time.

export interface MockInquiry {
  vendorId: string;
  clientName: string;
  clientEmail: string;
  message: string;
  read: boolean;
}

export const inquiries: MockInquiry[] = [
  {
    vendorId: "maria-rosales",
    clientName: "Dana Whitfield",
    clientEmail: "dana.whitfield@example.com",
    message:
      "Hi Maria — my father was just moved to home hospice and our family feels lost. Could we set up an initial call this week to talk about vigil support?",
    read: false,
  },
  {
    vendorId: "maria-rosales",
    clientName: "Eli Brooks",
    clientEmail: "eli.brooks@example.com",
    message:
      "We're planning ahead for my mom and would love help with advance care conversations. What does your process look like, and do you work on a sliding scale?",
    read: false,
  },
  {
    vendorId: "maria-rosales",
    clientName: "Priya Raman",
    clientEmail: "priya.raman@example.com",
    message:
      "Thank you for the gentle conversation last month — following up to schedule a few more sessions for our family.",
    read: true,
  },
  {
    vendorId: "threshold-wellness",
    clientName: "Sam Ortega",
    clientEmail: "sam.ortega@example.com",
    message:
      "Looking for in-home end-of-life doula support for my partner. Are you taking new clients in the Boulder area right now?",
    read: false,
  },
];
