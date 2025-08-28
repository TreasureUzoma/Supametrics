"use client";

import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { signInSchema, signUpSchema } from "@repo/ui/lib/zod";
import { devUrl } from "@/constants";
import type { ZodIssue } from "zod";
import { toast } from "sonner";

export type AuthMode = "login" | "signup" | "forgot";

export type AuthValues = {
  name?: string;
  email: string;
  password: string;
};

export function useAuth() {
  const pathname = usePathname();

  const mode = useMemo<AuthMode>(() => {
    if (pathname === "/signup") return "signup";
    if (pathname === "/forgot-password") return "forgot";
    return "login";
  }, [pathname]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    name: "",
    email: "",
    password: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError({ name: "", email: "", password: "", general: "" });
    setSuccess(false);
  };

  const values: AuthValues = { name, email, password };

  const handleErrors = (issues: ZodIssue[]) => {
    console.log("Validation errors:", issues);
    const newErrors = { name: "", email: "", password: "", general: "" };

    issues.forEach((issue) => {
      const field = issue.path[0]; // could be undefined

      if (typeof field === "string" && field in newErrors) {
        newErrors[field as keyof typeof newErrors] = issue.message;
      } else {
        newErrors.general = issue.message;
        toast.error(issue.message);
      }
    });

    setError(newErrors);
  };

  // api calls
  const handleSignIn = async () => {
    const isValid = signInSchema.safeParse(values);
    if (!isValid.success) {
      handleErrors(isValid.error.issues);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${devUrl}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to sign in");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error signing in";
      setError((prev) => ({
        ...prev,
        general: message,
      }));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    const isValid = signUpSchema.safeParse(values);
    if (!isValid.success) {
      handleErrors(isValid.error.issues);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${devUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to sign up");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error signing up";
      setError((prev) => ({
        ...prev,
        general: message,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${devUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error sending reset email";
      setError((prev) => ({
        ...prev,
        general: message,
      }));
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    values,
    error,
    loading,
    success,
    setName,
    name,
    email,
    password,
    setEmail,
    setPassword,
    reset,
    signin: handleSignIn,
    signup: handleSignUp,
    forgotPassword: handleForgotPassword,
    googleLogin: async () => {
      // TODO: implement OAuth flow
      console.log("google login not implemented yet");
    },
  };
}
