"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Stethoscope,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Sparkles,
  KeyRound,
  UserCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useClinicTheme } from "@/components/theme/clinic-theme-provider";
import { ClinicLogo } from "@/components/ui/clinic-logo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/today";
  const urlError = searchParams.get("error");

  const { currentTheme, brandConfig } = useClinicTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    urlError === "AccessDenied"
      ? "Access restricted: Only authorized clinic administrators and registered staff members can access this portal."
      : urlError
        ? "Authentication failed. Please check your credentials or try again."
        : null
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
      callbackUrl,
    });

    if (res?.error) {
      setErrorMsg(
        "Invalid email or password. Access is restricted to registered clinic staff and administrators."
      );
      setLoading(false);
    } else {
      window.location.href = callbackUrl || "/admin/today";
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setErrorMsg("Failed to connect to Google. Please verify your Google OAuth credentials in .env");
      setLoading(false);
    }
  };

  return (
    <div className="from-brand-accent/25 flex min-h-screen flex-col items-center justify-center bg-gradient-to-b via-brand-background to-brand-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Clinic Brand Header */}
        <div className="space-y-2 text-center">
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <ClinicLogo size="lg" />
            <div className="text-left">
              <span className="block font-heading text-xl font-bold text-brand-text">
                {brandConfig?.logo?.clinicDisplayName || "CA Smile Dental Clinic"}
              </span>
              <span className="-mt-1 block text-xs font-medium text-brand-muted">
                {brandConfig?.logo?.tagline || "Multispeciality Dental Care"}
              </span>
            </div>
          </Link>

          <h1 className="pt-2 font-heading text-2xl font-extrabold tracking-tight text-brand-text">
            Staff &amp; Admin Portal
          </h1>
          <p className="text-xs text-brand-muted">
            Authenticated clinical operations, calendar, and clinic management.
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="border-brand-border shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Staff &amp; Admin Authentication</CardTitle>
            <CardDescription>
              Sign in with your Google Account or assigned clinic credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-clinic border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google OAuth Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-clinic border border-brand-border bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-2 flex items-center justify-center">
              <div className="w-full border-t border-brand-border" />
              <span className="absolute bg-brand-surface px-3 text-[11px] font-medium uppercase tracking-wider text-brand-muted">
                or email credentials
              </span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Staff / Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-brand-muted" />
                  <Input
                    required
                    type="email"
                    placeholder="you@gmail.com or staff email"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-brand-text">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-brand-muted" />
                  <Input
                    required
                    type="password"
                    placeholder="••••••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="w-full font-semibold shadow-sm"
              >
                {loading ? "Authenticating..." : "Sign In to Clinic Portal"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Public Site */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-brand-muted transition-colors hover:text-brand-primary"
          >
            <span>Return to Public Clinic Website</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
          <p className="text-[11px] text-brand-muted">
            CA Smile Dental Clinic Management Platform
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-brand-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
