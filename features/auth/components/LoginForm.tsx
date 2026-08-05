"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema } from "../schemas/login.schema";
import type { LoginFormData } from "../types";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AUTH_TEXT } from "../constants/auth-text";
import PasswordInput from "../passwordInput";
import { Controller, useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { AUTH_ROUTES } from "../constants/auth-routes";
import LoadingButton from "@/components/common/LoadingButton";
import { login } from "../services/auth.service";

export default function LoginForm() {
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
  try {
    const response = await login(data);

    console.log(response);
  } catch (error) {
    console.error(error);
  }
}

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>

        <Input
          id="email"
          type="email"
          placeholder={AUTH_TEXT.LOGIN.EMAIL_PLACEHOLDER}
          {...register("email")}
        />

        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>

        <PasswordInput
          id="password"
          placeholder={AUTH_TEXT.LOGIN.PASSWORD_PLACEHOLDER}
          autoComplete="current-password"
          {...register("password")}
        />

        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Controller
          control={control}
          name="rememberMe"
          render={({ field }) => (
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />

              <span className="text-sm">Remember me</span>
            </label>
          )}
        />

        <Link
          type="button"
          className="text-sm font-medium text-primary hover:underline"
          href={AUTH_ROUTES.FORGOT_PASSWORD}
        >
          Forgot password?
        </Link>
      </div>

      <LoadingButton
        type="submit"
        className="w-full"
        loading={isSubmitting}
        loadingText="Signing In..."
      >
        Sign In
      </LoadingButton>
    </form>
  );
}
