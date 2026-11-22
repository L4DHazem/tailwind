import React, { useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import z from "zod";

import {
  Button,
  FieldError,
  Input,
  Label,
  TextField,
} from "@heroui/react";

import { useNavigate } from "react-router-dom";

import { supabase } from "../supabaseClient";

const schema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email"),

  password: z
    .string()
    .min(1, "Password is required"),
});

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const [apiError, setApiError] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },

    resolver: zodResolver(schema),

    mode: "onBlur",

    reValidateMode: "onBlur",
  });

  function showError(fieldName) {
    return Boolean(
      errors[fieldName] && (touchedFields[fieldName] || isSubmitted)
    );
  }

  async function handleLogin(userData) {
    setIsLoading(true);

    setApiError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        setApiError(error.message || "Invalid email or password");
        return;
      }

      alert("Login Successful!");

      navigate("/");
    } catch (error) {
      setApiError(
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-amber-200/20 bg-stone-950/70 px-4 py-3 text-amber-50 shadow-inner shadow-black/20 outline-none transition placeholder:text-stone-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30";

  return (
    <div className="relative min-h-screen overflow-hidden bg-stone-950 px-4 py-10">
      {/* Autumn background lights */}
      <div className="pointer-events-none absolute -left-24 -top-20 h-80 w-80 rounded-full bg-orange-700/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-amber-600/15 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-950/30 blur-3xl" />

      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <form
          onSubmit={handleSubmit(handleLogin)}
          noValidate
          className="w-full max-w-md overflow-hidden rounded-[28px] border border-amber-100/20 bg-stone-900/95 shadow-2xl shadow-black/60"
        >
          {/* Header */}
          <div className="border-b border-amber-100/10 bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950/80 px-6 py-8 sm:px-9">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200/30 bg-orange-700 text-2xl shadow-lg shadow-orange-950/70">
                🍂
              </div>

              <div>
                <p className="text-sm font-bold tracking-wide text-amber-300">
                  Autumn Timber
                </p>

                <p className="mt-0.5 text-xs text-stone-400">
                  Welcome back to your cozy space
                </p>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-amber-50">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm leading-6 text-stone-400">
              Log in to continue your journey.
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-5 p-6 sm:p-9">
            {apiError && (
              <div className="rounded-xl border border-red-400/30 bg-red-950/60 p-4 text-sm font-medium text-red-200">
                {apiError}
              </div>
            )}

            <TextField
              isInvalid={showError("email")}
              className="flex flex-col gap-2"
            >
              <Label className="text-sm font-semibold text-amber-100">
                Email Address
              </Label>

              <Input
                type="email"
                placeholder="Enter your email"
                {...register("email")}
                className={inputClass}
              />

              <FieldError className="text-xs font-medium text-red-300">
                {errors.email?.message}
              </FieldError>
            </TextField>

            <TextField
              isInvalid={showError("password")}
              className="flex flex-col gap-2"
            >
              <Label className="text-sm font-semibold text-amber-100">
                Password
              </Label>

              <Input
                type="password"
                placeholder="Enter your password"
                {...register("password")}
                className={inputClass}
              />

              <FieldError className="text-xs font-medium text-red-300">
                {errors.password?.message}
              </FieldError>
            </TextField>

            <Button
              type="submit"
              variant="primary"
              className="mt-2 min-h-[52px] w-full rounded-xl bg-gradient-to-r from-orange-700 to-amber-600 text-base font-bold text-amber-50 shadow-lg shadow-orange-950/70 transition hover:from-orange-600 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
              isDisabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="border-t border-amber-100/10 pt-5 text-center">
              <p className="text-sm text-stone-400">
                New here?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/Register")}
                  className="font-bold text-amber-300 transition hover:text-amber-200"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}