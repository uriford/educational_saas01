"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { forgotPasswordSchema } from "../schemas/forgot-password.schema";
import type { ForgotPasswordFormData } from "../schemas/forgot-password.schema";
import { forgotPasswordAction } from "../actions/forgot-password.action";
import { AUTH_ROUTES } from "../constants/auth-routes";
import { AUTH_TEXT } from "../constants/auth-text";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LoadingButton from "@/components/common/LoadingButton";

export default function ForgotPasswordForm() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setServerError("");
    setSuccessMessage("");

    try {
      const result = await forgotPasswordAction(data);

      if (!result.success) {
        setServerError(result.message);
        return;
      }

      setSuccessMessage(result.message);
    } catch (error) {
      console.error("FORGOT PASSWORD ERROR:", error);

      setServerError(
        "Unable to process your request. Please try again later.",
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

      <div className="space-y-2">
        <Label htmlFor="email">
          {AUTH_TEXT.FORGOT_PASSWORD.EMAIL_LABEL}
        </Label>

        <Input
          id="email"
          type="email"
          placeholder={
            AUTH_TEXT.FORGOT_PASSWORD.EMAIL_PLACEHOLDER
          }
          autoComplete="email"
          {...register("email")}
        />

        {errors.email && (
          <p className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <LoadingButton
        type="submit"
        className="w-full"
        loading={isSubmitting}
        loadingText={AUTH_TEXT.FORGOT_PASSWORD.LOADING}
      >
        {AUTH_TEXT.FORGOT_PASSWORD.SUBMIT}
      </LoadingButton>

      <div className="border-t pt-5 text-center">
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="text-sm font-semibold text-primary hover:underline"
        >
          {AUTH_TEXT.FORGOT_PASSWORD.BACK_TO_LOGIN}
        </Link>
      </div>
    </form>
  );
}
