import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Test-only credentials provider — active only when AUTH_TEST_MODE=true.
// Allows E2E tests to sign in without Google OAuth.
// Never expose this in production (AUTH_TEST_MODE must not be set).
const testProvider =
  process.env.AUTH_TEST_MODE === "true"
    ? [
        Credentials({
          id: "test-credentials",
          name: "Test",
          credentials: {
            email: { label: "Email", type: "email" },
            name: { label: "Name", type: "text" },
          },
          async authorize(credentials) {
            if (!credentials?.email) return null;
            const user = await prisma.user.upsert({
              where: { email: credentials.email as string },
              update: {},
              create: {
                email: credentials.email as string,
                name: (credentials.name as string) ?? "Test User",
                emailVerified: new Date(),
              },
            });
            return user;
          },
        }),
      ]
    : [];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    ...testProvider,
  ],
  session: { strategy: "database" },
  pages: { signIn: "/login" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
