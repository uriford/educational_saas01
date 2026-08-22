"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";

import { loginSchema } from "../schemas/login.schema";
import type { LoginFormData } from "../types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingButton from "@/components/common/LoadingButton";

import { AUTH_TEXT } from "../constants/auth-text";
import { AUTH_ROUTES } from "../constants/auth-routes";
import PasswordInput from "../passwordInput";

export default function LoginForm() {
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: LoginFormData) {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe ? "true" : "false",
      redirect: false,
    });

    if (result?.error) {
      console.error("AUTH.JS ERROR:", result.error);
      throw new Error(result.error);
    }

    const session = await getSession();

    switch (session?.user?.role) {
      case "GUARDIAN":
        router.push("/guardian");
        break;

      case "STUDENT":
        if (session?.user?.organizationId) {
          router.push("/student");
        } else {
          router.push("/courses");
        }
        break;

      case "SUPER_ADMIN":
      case "ORGANIZATION_ADMIN":
      case "BRANCH_ADMIN":
      default:
        router.push("/dashboard");
        break;
    }

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        try {
          await onSubmit(data);
        } catch (error) {
          console.error("LOGIN ERROR:", error);
        }
      })}
      className="space-y-6"
    >
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          {AUTH_TEXT.LOGIN.EMAIL_LABEL}
        </Label>

        <Input
          id="email"
          type="email"
          placeholder={AUTH_TEXT.LOGIN.EMAIL_PLACEHOLDER}
          autoComplete="email"
          {...register("email")}
        />

        {errors.email && (
          <p className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">
          {AUTH_TEXT.LOGIN.PASSWORD_LABEL}
        </Label>

        <PasswordInput
          id="password"
          placeholder={AUTH_TEXT.LOGIN.PASSWORD_PLACEHOLDER}
          autoComplete="current-password"
          {...register("password")}
        />

        {errors.password && (
          <p className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember + Forgot password */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Controller
          control={control}
          name="rememberMe"
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />

              <span className="text-sm">
                {AUTH_TEXT.LOGIN.REMEMBER_ME}
              </span>
            </label>
          )}
        />

        <Link
          className="text-sm font-medium text-primary hover:underline"
          href={AUTH_ROUTES.FORGOT_PASSWORD}
        >
          {AUTH_TEXT.LOGIN.FORGOT_PASSWORD}
        </Link>
      </div>

      <LoadingButton
        type="submit"
        className="w-full"
        loading={isSubmitting}
        loadingText={AUTH_TEXT.LOGIN.LOADING}
      >
        {AUTH_TEXT.LOGIN.SUBMIT}
      </LoadingButton>

      {/* Student signup */}
      <div className="border-t pt-5 text-center">
        <p className="text-sm text-muted-foreground">
          New student?
        </p>

        <Link
          href="/signup"
          className="mt-1 inline-flex text-sm font-semibold text-primary hover:underline"
        >
          Create a student account
        </Link>
      </div>
    </form>
  );
}
