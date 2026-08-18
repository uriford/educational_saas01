"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { signupSchema } from "../schemas/signup.schema";
import type { SignupFormData } from "../schemas/signup.schema";
import { signupAction } from "../actions/signup.action";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/common/LoadingButton";
import PasswordInput from "../passwordInput";

export default function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: SignupFormData) {
    setServerError("");
    setSuccessMessage("");

    const result = await signupAction(data);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    setSuccessMessage(result.message);

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {serverError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
          {successMessage}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>

          <Input
            id="firstName"
            placeholder="John"
            autoComplete="given-name"
            {...register("firstName")}
          />

          {errors.firstName && (
            <p className="text-sm text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>

          <Input
            id="lastName"
            placeholder="Doe"
            autoComplete="family-name"
            {...register("lastName")}
          />

          {errors.lastName && (
            <p className="text-sm text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>

        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          autoComplete="email"
          {...register("email")}
        />

        {errors.email && (
          <p className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>

        <Input
          id="phone"
          type="tel"
          placeholder="017XXXXXXXX"
          autoComplete="tel"
          {...register("phone")}
        />

        {errors.phone && (
          <p className="text-sm text-destructive">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>

        <PasswordInput
          id="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          {...register("password")}
        />

        {errors.password && (
          <p className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirm password
        </Label>

        <PasswordInput
          id="confirmPassword"
          placeholder="Confirm your password"
          autoComplete="new-password"
          {...register("confirmPassword")}
        />

        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <LoadingButton
        type="submit"
        className="w-full"
        loading={isSubmitting}
        loadingText="Creating account..."
      >
        Create student account
      </LoadingButton>

      <div className="border-t pt-5 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?
        </p>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-1 text-sm font-semibold text-primary hover:underline"
        >
          Sign in
        </button>
      </div>
    </form>
  );
}
