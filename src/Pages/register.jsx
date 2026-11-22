import React, { useState } from "react";
import {
  Button,
  TextField,
  Label,
  Input,
  FieldError,
  Select,
  ListBox,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d ]).{8,15}$/;

const schema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters")
      .max(20, "Name must be at most 20 characters")
      .regex(/^[A-Za-z ]+$/, "Name can contain letters and spaces only"),

    email: z
      .string()
      .trim()
      .email("Please enter a valid email"),

    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must contain uppercase, lowercase, number, symbol, and be 8-15 characters"
      ),

    rePassword: z
      .string()
      .min(1, "Please confirm your password"),

    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((dob) => {
        const date = new Date(dob);
        if (isNaN(date.getTime())) return false;

        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < date.getDate())
        ) {
          age -= 1;
        }

        return age >= 18;
      }, "User must be at least 18 years old"),

    gender: z
      .string()
      .trim()
      .min(1, "Gender is required"),
  })
  .refine((data) => data.password === data.rePassword, {
    path: ["rePassword"],
    message: "Password and RePassword do not match",
  });

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rePassword: "",
      dateOfBirth: "",
      gender: "",
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

  async function signup(userData) {
    setIsLoading(true);
    setApiError("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            display_name: userData.name,
            date_of_birth: userData.dateOfBirth,
            gender: userData.gender,
          },
        },
      });

      if (error) {
        setApiError(error.message);
        return;
      }

      alert(
        "Registration successful! Please check your email to verify your account."
      );

      navigate("/Login");
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
      {/* Autumn ambient lighting */}
      <div className="pointer-events-none absolute -left-24 -top-20 h-80 w-80 rounded-full bg-orange-700/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-amber-600/15 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-950/30 blur-3xl" />

      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center">
        <form
          onSubmit={handleSubmit(signup)}
          noValidate
          className="w-full max-w-lg overflow-hidden rounded-[28px] border border-amber-100/20 bg-stone-900/95 shadow-2xl shadow-black/60"
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
                  Create your warm new beginning
                </p>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-amber-50">
              Register Now
            </h1>

            <p className="mt-2 text-sm leading-6 text-stone-400">
              Join us and create your account in just a few steps.
            </p>
          </div>

          <div className="p-6 sm:p-9">
            {apiError && (
              <div className="mb-5 rounded-xl border border-red-400/30 bg-red-950/60 p-4 text-sm font-medium text-red-200">
                {apiError}
              </div>
            )}

            <div className="flex flex-col gap-5">
              <TextField
                isInvalid={showError("name")}
                className="flex flex-col gap-2"
              >
                <Label className="text-sm font-semibold text-amber-100">
                  Name
                </Label>

                <Input
                  type="text"
                  placeholder="Enter your name"
                  {...register("name")}
                  className={inputClass}
                />

                <FieldError className="text-xs font-medium text-red-300">
                  {errors.name?.message}
                </FieldError>
              </TextField>

              <TextField
                isInvalid={showError("email")}
                className="flex flex-col gap-2"
              >
                <Label className="text-sm font-semibold text-amber-100">
                  Email
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

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextField
                  isInvalid={showError("password")}
                  className="flex flex-col gap-2"
                >
                  <Label className="text-sm font-semibold text-amber-100">
                    Password
                  </Label>

                  <Input
                    type="password"
                    placeholder="Create password"
                    {...register("password")}
                    className={inputClass}
                  />

                  <FieldError className="text-xs font-medium text-red-300">
                    {errors.password?.message}
                  </FieldError>
                </TextField>

                <TextField
                  isInvalid={showError("rePassword")}
                  className="flex flex-col gap-2"
                >
                  <Label className="text-sm font-semibold text-amber-100">
                    Confirm Password
                  </Label>

                  <Input
                    type="password"
                    placeholder="Confirm password"
                    {...register("rePassword")}
                    className={inputClass}
                  />

                  <FieldError className="text-xs font-medium text-red-300">
                    {errors.rePassword?.message}
                  </FieldError>
                </TextField>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <TextField
                  isInvalid={showError("dateOfBirth")}
                  className="flex flex-col gap-2"
                >
                  <Label className="text-sm font-semibold text-amber-100">
                    Date of Birth
                  </Label>

                  <Input
                    type="date"
                    {...register("dateOfBirth")}
                    className={inputClass}
                  />

                  <FieldError className="text-xs font-medium text-red-300">
                    {errors.dateOfBirth?.message}
                  </FieldError>
                </TextField>

                <Select
                  placeholder="Select your Gender"
                  isInvalid={showError("gender")}
                  selectedKey={watch("gender") || null}
                  onSelectionChange={(key) =>
                    setValue("gender", String(key), {
                      shouldValidate: true,
                      shouldTouch: true,
                    })
                  }
                  className="flex flex-col gap-2"
                >
                  <Label className="text-sm font-semibold text-amber-100">
                    Gender
                  </Label>

                  <Select.Trigger className="min-h-[48px] rounded-xl border border-amber-200/20 bg-stone-950/70 px-4 text-amber-50 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>

                  <Select.Popover className="rounded-xl border border-amber-100/20 bg-stone-900 text-amber-50 shadow-xl shadow-black/50">
                    <ListBox>
                      <ListBox.Item
                        id="male"
                        textValue="Male"
                        className="cursor-pointer px-4 py-3 text-sm text-amber-50 outline-none hover:bg-orange-800/50"
                      >
                        Male
                      </ListBox.Item>

                      <ListBox.Item
                        id="female"
                        textValue="Female"
                        className="cursor-pointer px-4 py-3 text-sm text-amber-50 outline-none hover:bg-orange-800/50"
                      >
                        Female
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>

                  <FieldError className="text-xs font-medium text-red-300">
                    {errors.gender?.message}
                  </FieldError>
                </Select>
              </div>

              <p className="-mt-1 text-xs leading-5 text-stone-500">
                Password must include uppercase, lowercase, number, symbol,
                and be 8–15 characters.
              </p>

              <Button
                type="submit"
                variant="primary"
                isDisabled={isLoading}
                className="mt-2 min-h-[52px] w-full rounded-xl bg-gradient-to-r from-orange-700 to-amber-600 text-base font-bold text-amber-50 shadow-lg shadow-orange-950/70 transition hover:from-orange-600 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Signing up..." : "Create My Account"}
              </Button>

              <p className="text-center text-xs text-stone-500">
                By registering, you confirm that you are at least 18 years
                old.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}