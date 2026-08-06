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
} from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

async function handleLogin(e: React.FormEvent) {
  e.preventDefault();

  console.log("Login clicked");

  try {
    console.log("Sending request...");

    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    console.log("Response:", data);

    chrome.storage.local.set({
      token: data.token,
    });

    console.log("Saved token");

    navigate("/dashboard");
  } catch (err: any) {
    console.log(err);
  console.log(err.response);
  console.log(err.response?.data);
  }
}

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 p-3">
      <Card className="w-[750px] h-[580px]">
        <CardHeader>
          <CardTitle>Client Manager</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div>
              <Label>Email</Label>

              <Input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />
            </div>

            <div>
              <Label>Password</Label>

              <Input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />
            </div>

<Button type="submit" className="w-full">
  Login
</Button>

            <p className="text-center">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500"
              >
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}