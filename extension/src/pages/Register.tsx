import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/api";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    if (!trimmedEmail) {
      setError("Email is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        name: trimmedName,
        email: trimmedEmail,
        password,
      });

      window.alert(
        "Account created successfully. Please log in.",
      );

      navigate("/login", {
        replace: true,
      });
    } catch (error: any) {
      console.error("Registration failed:", error);

      setError(
        error?.response?.data?.message ||
        "Failed to create account.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-[#f7faf8]">
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-green-100/40 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,185,129,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-[7%] top-[10%] h-24 w-12 rounded-[100%_0_100%_0] bg-emerald-100/70 blur-[0.2px]"
          style={{
            transform: "rotate(25deg)",
            animation: "leafFloatOne 7s ease-in-out infinite",
          }}
        />
        <div
          className="absolute right-[12%] top-[12%] h-20 w-10 rounded-[100%_0_100%_0] bg-emerald-100/60"
          style={{
            transform: "rotate(-25deg)",
            animation: "leafFloatTwo 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-8 right-[8%] h-72 w-72 opacity-60"
          style={{
            animation: "leafFloatThree 9s ease-in-out infinite",
          }}
        >
          <div
            className="absolute bottom-8 right-4 h-[2px] w-64 origin-right rotate-[-18deg] rounded-full bg-emerald-200/70"
          />
          <div
            className="absolute bottom-10 right-20 h-[2px] w-48 origin-right rotate-[8deg] rounded-full bg-emerald-200/60"
          />
          <div className="absolute bottom-16 right-12 h-24 w-12 rotate-[25deg] rounded-[100%_0_100%_0] bg-emerald-100/70" />
          <div className="absolute bottom-24 right-28 h-28 w-14 rotate-[-30deg] rounded-[100%_0_100%_0] bg-emerald-100/60" />
          <div className="absolute bottom-8 right-36 h-20 w-10 rotate-[-50deg] rounded-[100%_0_100%_0] bg-emerald-100/60" />
          <div className="absolute bottom-2 right-0 h-24 w-12 rotate-[55deg] rounded-[100%_0_100%_0] bg-emerald-100/70" />
          <div className="absolute bottom-32 right-2 h-20 w-10 rotate-[65deg] rounded-[100%_0_100%_0] bg-emerald-100/50" />
          <div className="absolute bottom-36 right-44 h-20 w-10 rotate-[-65deg] rounded-[100%_0_100%_0] bg-emerald-100/50" />
        </div>
        <div
          className="absolute bottom-[8%] left-[12%] h-16 w-8 rotate-[65deg] rounded-[100%_0_100%_0] bg-emerald-100/45"
          style={{
            animation: "leafFloatTwo 10s ease-in-out infinite",
          }}
        />
      </div>
      <div className="relative z-10 flex h-full min-h-0 items-center justify-center overflow-y-auto px-5 py-4 sm:px-8 sm:py-5">
        <div className="my-auto w-full max-w-[390px]">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <img
              src="/worknest.png"
              alt="Worknest"
              className="h-30 w-46 object-contain"
            />
          </div>
          <div className="relative overflow-hidden rounded-[24px] border border-white/90 bg-white/85 p-5 shadow-[0_20px_60px_rgba(30,60,40,0.10)] backdrop-blur-xl sm:p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-100/30 blur-3xl" />

            <form
              onSubmit={handleSubmit}
              className="relative z-10 space-y-3"
            >
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500"
                >
                  Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Your name"
                  autoComplete="name"
                  disabled={loading}
                  maxLength={100}
                  className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  disabled={loading}
                  className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50"
                />
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="h-9 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:bg-gray-50"
                />
              </div>
              {confirmPassword && (
                <div
                  className={`flex items-center gap-1.5 text-[10px] ${password === confirmPassword
                      ? "text-emerald-600"
                      : "text-red-500"
                    }`}
                >
                  <span>
                    {password === confirmPassword
                      ? "✓"
                      : "!"}
                  </span>

                  <span>
                    {password === confirmPassword
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </span>
                </div>
              )}
              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2">
                  <p className="text-[11px] leading-4 text-red-600">
                    {error}
                  </p>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-1 h-9 w-full overflow-hidden rounded-xl bg-gray-900 px-4 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="absolute inset-y-0 -left-10 w-8 rotate-12 bg-white/20 transition-transform duration-700 group-hover:translate-x-[450px]" />
                <span className="relative">
                  {loading
                    ? "Creating account..."
                    : "Create account →"}
                </span>
              </button>
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-gray-100" />

                <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-gray-300">
                  Already a member?
                </span>

                <div className="h-px flex-1 bg-gray-100" />
              </div>
              <div className="text-center">
                <p className="text-[11px] text-gray-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-gray-900 transition hover:text-emerald-600"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes leafFloatOne {
            0%, 100% {
              transform: translateY(0) rotate(25deg);
            }

            50% {
              transform: translateY(-10px) rotate(31deg);
            }
          }

          @keyframes leafFloatTwo {
            0%, 100% {
              transform: translateY(0) rotate(-25deg);
            }

            50% {
              transform: translateY(12px) rotate(-18deg);
            }
          }

          @keyframes leafFloatThree {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
            }

            50% {
              transform: translateY(-8px) rotate(1deg);
            }
          }
        `}
      </style>
    </div>
  );
}