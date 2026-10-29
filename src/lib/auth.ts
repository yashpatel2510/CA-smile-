import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import prisma, { authPrisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import { env } from "@/lib/env";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
        GoogleProvider({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
          allowDangerousEmailAccountLinking: true,
          authorization: {
            params: {
              prompt: "select_account",
              access_type: "offline",
              response_type: "code",
            },
          },
        }),
      ]
      : []),
    CredentialsProvider({
      name: "Clinic Admin Portal",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "admin@casmile.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide both email and password.");
        }

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

        // Authorized Owner emails list (strictly from environment)
        const ownerEmails = (env.OWNER_EMAILS || process.env.OWNER_EMAILS || "")
          .toLowerCase()
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);

        const isOwner = ownerEmails.length > 0 && ownerEmails.includes(email);

        const configuredAdminPassword =
          (env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "").trim();

        // 1. Clinic Owner / Admin Login
        if (isOwner) {
          if (!configuredAdminPassword || password !== configuredAdminPassword) {
            throw new Error("Invalid admin password. Access denied.");
          }

          try {
            let user = await authPrisma.staffUser.findFirst({
              where: { email },
              include: { clinic: true },
            });

            if (!user) {
              const defaultClinic = await authPrisma.clinic.findFirst();
              if (defaultClinic) {
                user = await authPrisma.staffUser.create({
                  data: {
                    clinicId: defaultClinic.id,
                    email,
                    name: "Clinic Admin",
                    role: "ADMIN",
                    specialty: "Chief Dental Officer & Clinic Owner",
                    isActive: true,
                  },
                  include: { clinic: true },
                });
              }
            }

            return {
              id: user?.id || "admin-owner-id",
              name: user?.name || "Clinic Admin",
              email,
              role: "ADMIN",
              clinicId: user?.clinicId || "clinic-main-001",
            };
          } catch {
            return {
              id: "admin-owner-id",
              name: "Clinic Admin",
              email,
              role: "ADMIN",
              clinicId: "clinic-main-001",
            };
          }
        }

        // 2. Staff Member Login (e.g., ana / yap050302@gmail.com)
        try {
          const staffUser = await authPrisma.staffUser.findFirst({
            where: { email },
            include: { clinic: true },
          });

          if (!staffUser || !staffUser.isActive) {
            throw new Error(
              "Access denied: No active staff account found with this email. Please contact the clinic administrator."
            );
          }

          // Check staff password with strong encryption verification
          let isValidPassword = false;
          if (staffUser.password) {
            isValidPassword = await verifyPassword(password, staffUser.password);
          } else {
            // If staff has no custom password yet, check configured admin password
            isValidPassword =
              Boolean(configuredAdminPassword) &&
              password === configuredAdminPassword;
          }

          if (!isValidPassword) {
            throw new Error("Invalid password for this staff account.");
          }

          return {
            id: staffUser.id,
            name: staffUser.name,
            email: staffUser.email,
            role: staffUser.role,
            clinicId: staffUser.clinicId,
          };
        } catch (error: any) {
          if (
            error.message.includes("Access denied") ||
            error.message.includes("Invalid password") ||
            error.message.includes("No active staff")
          ) {
            throw error;
          }
          throw new Error("Authentication failed. Only registered clinic staff and admins may access this portal.");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase().trim();
        if (!email) return false;

        // Configured owner emails (strictly from environment)
        const ownerEmails = (env.OWNER_EMAILS || process.env.OWNER_EMAILS || "")
          .toLowerCase()
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);

        const isOwner = ownerEmails.length > 0 && ownerEmails.includes(email);

        // Check if user is registered in the Staff roster (e.g., yap050302@gmail.com)
        let existingStaff = null;
        try {
          existingStaff = await authPrisma.staffUser.findFirst({
            where: { email },
          });
        } catch {
          // Database fallback
        }

        // REJECT if not owner AND not an active registered staff member
        if (!isOwner && (!existingStaff || !existingStaff.isActive)) {
          console.warn(`[Security] Unauthorized Google login attempted by: ${email}`);
          return false;
        }

        // Owner is always ADMIN; staff gets their configured role (ADMIN or STAFF)
        const assignedRole = isOwner
          ? "ADMIN"
          : existingStaff?.role || "STAFF";

        // Auto-provision owner record if missing
        if (isOwner && !existingStaff) {
          try {
            const defaultClinic = await authPrisma.clinic.findFirst();
            if (defaultClinic) {
              existingStaff = await authPrisma.staffUser.create({
                data: {
                  clinicId: defaultClinic.id,
                  email,
                  name: user.name || "Clinic Admin",
                  role: "ADMIN",
                  specialty: "Chief Dental Officer & Clinic Owner",
                  isActive: true,
                },
              });
            }
          } catch {
            // Write fallback
          }
        }

        (user as any).role = assignedRole;
        (user as any).clinicId = existingStaff?.clinicId || "clinic-main-001";
        return true;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || token.role || "STAFF";
        token.clinicId = (user as any).clinicId || token.clinicId || "clinic-main-001";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.clinicId = token.clinicId as string;
      }
      return session;
    },
  },
};
