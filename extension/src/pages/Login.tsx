import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/api/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      await new Promise<void>((resolve) => {
        chrome.storage.local.set(
          {
            token: data.token,
            user: data.user,
          },
          () => resolve()
        );
      });
console.log("TOKEN SAVED:", data.token);
console.log("NAVIGATING TO WORKSPACE");
      navigate("/workspace", {
        replace: true,
      });
    } catch (err: any) {
      console.error("Login failed:", err);

      setError(
        err?.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[580px] w-[760px] items-center justify-center bg-gray-50 px-6">
      <Card className="w-full max-w-md border-gray-200 shadow-sm">
        <CardHeader className="space-y-2 pb-5 text-center">
          {/* Logo / icon */}
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-lg text-white">
            C
          </div>

          <CardTitle className="text-xl font-semibold">
            Welcome back
          </CardTitle>

          <CardDescription className="text-sm text-gray-500">
            Sign in to manage your personal and team
            workspaces.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </Label>

              <Input
                id="email"
                type="email"
                value={email}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="h-10"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>

              <Input
                id="password"
                type="password"
                value={password}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="h-10"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                <p className="text-xs text-red-600">
                  {error}
                </p>
              </div>
            )}

            {/* Login button */}
            <Button
              type="submit"
              disabled={loading}
              className="h-10 w-full"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </Button>

            {/* Register */}
            <div className="pt-2 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-medium text-gray-900 hover:underline"
                >
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}