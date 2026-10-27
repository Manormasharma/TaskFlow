"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { useAuth } from "./AuthProvider";
import { login, register } from "@/lib/auth";
import { Alert, Button, Input } from "./ui";
import { Logo } from "./AppShell";

type Errors = Partial<Record<"name" | "email" | "password", string>>;

function validate(isRegister: boolean, name: string, email: string, password: string): Errors {
  const errors: Errors = {};
  if (isRegister && name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Enter a valid email address.";
  if (isRegister) {
    if (password.length < 8) errors.password = "Password must be at least 8 characters.";
    else if (password.length > 72) errors.password = "Password must be 72 characters or fewer.";
  } else if (!password) {
    errors.password = "Enter your password.";
  }
  return errors;
}

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const { setUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    setApiError("");

    const found = validate(isRegister, name, email, password);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const user = isRegister ? await register(name.trim(), email, password) : await login(email, password);
      setUser(user);
      router.replace("/dashboard");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <main className="grid flex-1 lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <Logo light />
        <div>
          <h2 className="text-3xl font-bold leading-tight">Plan work. Track progress. Ship on time.</h2>
          <p className="mt-3 max-w-md text-slate-300">
            One clear place for your team&apos;s tasks, priorities and deadlines.
          </p>
        </div>
        <p className="text-sm text-slate-400">© TaskFlow</p>
      </aside>

      <div className="flex items-center justify-center bg-white px-4 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 block lg:hidden"><Logo /></Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">
            {isRegister ? "Start organizing your tasks today." : "Log in to continue to your workspace."}
          </p>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {apiError && <Alert>{apiError}</Alert>}
            {isRegister && (
              <Input id="name" label="Full name" autoComplete="name" value={name}
                onChange={(e) => setName(e.target.value)} error={errors.name} />
            )}
            <Input id="email" label="Email" type="email" autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)} error={errors.email} />
            <Input id="password" label="Password" type={showPassword ? "text" : "password"}
              autoComplete={isRegister ? "new-password" : "current-password"} value={password}
              onChange={(e) => setPassword(e.target.value)} error={errors.password} />
            {isRegister && <p className="text-xs text-slate-500">Use 8–72 characters.</p>}
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
              Show password
            </label>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Please wait..." : isRegister ? "Create account" : "Log in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600">
            {isRegister ? "Already have an account? " : "New to TaskFlow? "}
            <Link href={isRegister ? "/login" : "/register"} className="font-medium text-indigo-600 hover:underline">
              {isRegister ? "Log in" : "Create an account"}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
