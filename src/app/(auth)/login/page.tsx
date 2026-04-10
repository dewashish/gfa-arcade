"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    if (isSignup) {
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || email.split("@")[0] },
        },
      });

      if (signupError) {
        setError(signupError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl font-bold text-primary mb-2">
            GFA Arcade
          </h1>
          <p className="font-headline text-lg text-secondary">Adventure Hub</p>
          <p className="text-on-surface-variant mt-2 font-body">
            GEMS Founders School, Masdar City
          </p>
        </div>

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">
              {isSignup ? "Create Teacher Account" : "Teacher Login"}
            </h2>

            {isSignup && (
              <Input
                label="Your Name"
                icon="person"
                placeholder="Ms. Sarah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <Input
              label="Email"
              icon="mail"
              type="email"
              placeholder="teacher@gemsfounders.ae"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              icon="lock"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {error && (
              <div className="p-3 rounded-lg bg-error-container text-on-error-container text-sm font-body">
                {error}
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {isSignup ? "Create Account" : "Log In"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="w-full text-center text-sm text-primary font-body hover:underline mt-2"
            >
              {isSignup
                ? "Already have an account? Log in"
                : "New here? Create an account"}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
