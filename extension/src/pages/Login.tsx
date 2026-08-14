import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>,
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
          () => resolve(),
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
        "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative h-[580px] w-[760px] overflow-hidden bg-[#f8faf8]">
      <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-green-100/60 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#166534 1px, transparent 1px), linear-gradient(90deg, #166534 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-20 -right-20 h-[440px] w-[500px] rotate-[-10deg] opacity-[0.13]">
          <div className="absolute bottom-20 right-20 h-[2px] w-[380px] rotate-[-24deg] rounded-full bg-emerald-700" />
          <div className="absolute bottom-[145px] right-[245px] h-[1px] w-[115px] rotate-[-55deg] rounded-full bg-emerald-700" />
          <div className="absolute bottom-[190px] right-[170px] h-[1px] w-[130px] rotate-[20deg] rounded-full bg-emerald-700" />
          <div className="absolute bottom-[105px] right-[105px] h-[1px] w-[120px] rotate-[-65deg] rounded-full bg-emerald-700" />
          <div className="absolute bottom-[175px] right-[300px] h-16 w-28 -rotate-[35deg] rounded-[100%_0_100%_0] bg-emerald-600/70 blur-[0.2px]" />
          <div className="absolute bottom-[215px] right-[155px] h-20 w-32 rotate-[25deg] rounded-[0_100%_0_100%] bg-green-600/60" />
          <div className="absolute bottom-[115px] right-[245px] h-14 w-24 rotate-[-55deg] rounded-[100%_0_100%_0] bg-emerald-700/60" />
          <div className="absolute bottom-[90px] right-[65px] h-20 w-32 rotate-[20deg] rounded-[0_100%_0_100%] bg-green-700/50" />
          <div className="absolute bottom-[275px] right-[210px] h-16 w-28 rotate-[-20deg] rounded-[100%_0_100%_0] bg-emerald-600/50" />
          <div className="absolute bottom-[245px] right-[80px] h-14 w-24 rotate-[50deg] rounded-[0_100%_0_100%] bg-green-600/50" />
        </div>
        <div className="absolute left-10 top-20 animate-[float_7s_ease-in-out_infinite] opacity-[0.10]">
          <div className="h-12 w-20 rotate-[-30deg] rounded-[100%_0_100%_0] bg-emerald-600" />
        </div>
        <div className="absolute right-24 top-16 animate-[float_9s_ease-in-out_infinite] opacity-[0.08]">
          <div className="h-10 w-16 rotate-[35deg] rounded-[0_100%_0_100%] bg-green-700" />
        </div>
        <div className="absolute bottom-24 left-24 animate-[float_8s_ease-in-out_infinite] opacity-[0.07]">
          <div className="h-14 w-24 rotate-[20deg] rounded-[0_100%_0_100%] bg-emerald-600" />
        </div>
      </div>
      <div className="relative z-10 flex h-full items-center justify-center px-8">
        <div className="w-full max-w-[390px]">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center">
              <img
                src="/worknest.png"
                alt="Worknest"
                className="h-36 w-52 object-contain"
              />
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/85 p-6 shadow-[0_20px_60px_rgba(30,60,40,0.10)] backdrop-blur-xl">
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-green-100/40 blur-2xl" />
            <div className="relative">
              <form
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500"
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
                    className="h-10 rounded-xl border-gray-200 bg-gray-50/60 text-sm transition focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500"
                    >
                      Password
                    </Label>
                    <span className="cursor-default text-[10px] text-gray-400">
                      Secure login
                    </span>
                  </div>

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
                    className="h-10 rounded-xl border-gray-200 bg-gray-50/60 text-sm transition focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50/80 px-3 py-2.5">
                    <span className="mt-0.5 text-xs">
                      !
                    </span>

                    <p className="text-[11px] leading-4 text-red-600">
                      {error}
                    </p>
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="group relative h-10 w-full overflow-hidden rounded-xl bg-gray-900 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-gray-800 hover:shadow-md disabled:opacity-60"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">
                    {loading
                      ? "Signing in..."
                      : "Sign in →"}
                  </span>
                </Button>
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-[9px] uppercase tracking-widest text-gray-300">
                    or
                  </span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-semibold text-gray-900 transition hover:text-emerald-700 hover:underline"
                    >
                      Create one
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
          <div className="mt-5 text-center">
            <p className="text-[9px] tracking-wide text-gray-400">
              Your workspace. Your clients. Your workflow.
            </p>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent" />
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(-30deg);
          }

          50% {
            transform: translateY(-12px) rotate(-26deg);
          }
        }
      `}</style>
    </div>
  );
}