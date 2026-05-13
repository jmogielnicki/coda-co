import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { log } from "@/lib/log";

// Auth.js v5 config. The adapter writes sessions to the DB so we never
// hand a JWT to the browser; sessions are server-truth and revocable.
//
// Phase C only wires Credentials. OAuth providers slot in here later
// without schema or callback changes — that's the whole point of the
// Account/Session/VerificationToken tables landing in this phase.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // Auth.js v5 refuses requests whose Host header isn't on a trusted list
  // unless AUTH_URL is set or `trustHost` is true. Setting it explicitly
  // makes self-hosted / Docker / preview deployments work without needing
  // to plumb AUTH_URL into every environment. Vercel + similar trusted
  // platforms still get host-checked via the AUTH_TRUST_HOST env var.
  trustHost: true,

  // The Credentials provider can't use the database session strategy
  // directly (Auth.js limitation), so we issue a JWT for the auth
  // cookie and re-hydrate the user (including role) from the DB on
  // every request via the `session` callback below.
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = typeof creds?.email === "string" ? creds.email.trim().toLowerCase() : "";
        const password = typeof creds?.password === "string" ? creds.password : "";
        if (!email || !password) {
          log.warn("auth.signin_failed", { reason: "missing_credentials", email: email || null });
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) {
          log.warn("auth.signin_failed", { reason: "user_not_found", email });
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          log.warn("auth.signin_failed", { reason: "wrong_password", email, userId: user.id });
          return null;
        }

        log.info("auth.signin_succeeded", { userId: user.id, email });
        return { id: user.id, email: user.email, name: user.name ?? null };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    async session({ session, token }) {
      const uid = token.uid as string | undefined;
      if (uid) {
        const u = await prisma.user.findUnique({
          where: { id: uid },
          select: { id: true, email: true, name: true, role: true },
        });
        if (u) {
          session.user = {
            ...session.user,
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
          };
        } else {
          // JWT references a user that no longer exists — likely deleted
          // between cookie issuance and this request. Stale session, but
          // worth knowing about: a real user just hit a dead session.
          log.warn("auth.session_user_missing", { userId: uid });
        }
      }
      return session;
    },
  },
});
