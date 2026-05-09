import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// Every dashboard page calls this. Anon users go to login; signed-in
// users without a vendor_profile get bounced to the application flow.
export async function requireVendor() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/dashboard");

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    include: { subscriptions: true },
  });
  if (!vendor) redirect("/list-with-us");

  return { user: session.user, vendor };
}
