"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { resetPasswordAction } from "../actions/reset-password.action";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "../schemas/reset-password.schema";
import { AUTH_ROUTES } from "../constants/auth-routes";
import { AUTH_TEXT } from "../constants/auth-text";

import PasswordInput from "../passwordInput";
import LoadingButton from "@/components/common/LoadingButton";
import { Label } from "@/components/ui/label";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    setServerError("");
    setSuccessMessage("");

    if (!token) {
      setServerError(
        "This password reset link is invalid or missing.",
      );
      return;
    }

    try {
      const result = await resetPasswordAction({
        ...data,
        token,
      });

      if (!result.success) {
        setServerError(result.message);
        return;
      }

      setSuccessMessage(result.message);

      setTimeout(() => {
        router.push(AUTH_ROUTES.LOGIN);
      }, 1500);
    } catch (error) {
      console.error("RESET PASSWORD ERROR:", error);

      setServerError(
        "Unable to reset your password. Please try again later.",
      );
    }
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

      <input type="hidden" {...register("token")} />

      <div className="space-y-2">
        <Label htmlFor="password">
          {AUTH_TEXT.RESET_PASSWORD.PASSWORD_LABEL}
        </Label>

        <PasswordInput
          id="password"
          placeholder={
            AUTH_TEXT.RESET_PASSWORD.PASSWORD_PLACEHOLDER
          }
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
          {AUTH_TEXT.RESET_PASSWORD.CONFIRM_PASSWORD_LABEL}
        </Label>

        <PasswordInput
          id="confirmPassword"
          placeholder={
            AUTH_TEXT.RESET_PASSWORD.CONFIRM_PASSWORD_PLACEHOLDER
          }
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
        loadingText={AUTH_TEXT.RESET_PASSWORD.LOADING}
      >
        {AUTH_TEXT.RESET_PASSWORD.SUBMIT}
      </LoadingButton>

      <div className="border-t pt-5 text-center">
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {AUTH_TEXT.RESET_PASSWORD.BACK_TO_LOGIN}
        </Link>
      </div>
    </form>
  );
}
