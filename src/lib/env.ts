/**
 * Validates and exposes environment variables in a type-safe manner.
 */
export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "",
  EMAIL_API_KEY: process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || process.env.EMAIL_API_KEY || "",
  EMAIL_FROM:
    process.env.EMAIL_FROM ||
    "HealthSphere Clinic <notifications@healthsphere.example.com>",
  CRON_SECRET:
    process.env.CRON_SECRET || "clinic-cron-secret-key-for-reminders",
  AI_API_KEY: process.env.AI_API_KEY || "",
  AI_MODEL: process.env.AI_MODEL || "gemini-1.5-pro",
  NEXT_PUBLIC_APP_URL:
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  NEXT_PUBLIC_DEFAULT_CLINIC_SLUG:
    process.env.NEXT_PUBLIC_DEFAULT_CLINIC_SLUG || "acme-health",
  NEXT_PUBLIC_DEFAULT_THEME:
    process.env.NEXT_PUBLIC_DEFAULT_THEME || "teal-serenity",
  NEXTAUTH_SECRET:
    process.env.NEXTAUTH_SECRET ||
    "super-secret-clinic-auth-token-for-dev-session-key-32-chars-min",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  OWNER_EMAILS: process.env.OWNER_EMAILS || "casmileatbilimora@gmail.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "DrDeep@59570",
  AUTH_DATABASE_URL: process.env.AUTH_DATABASE_URL || "",
  ENCRYPTION_SECRET:
    process.env.ENCRYPTION_SECRET ||
    "super-secret-clinic-aes-256-encryption-key-for-credentials-32",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
};
