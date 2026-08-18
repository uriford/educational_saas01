import AuthCard from "@/features/auth/components/AuthCard";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";
import { AUTH_TEXT } from "@/features/auth/constants/auth-text";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title={AUTH_TEXT.FORGOT_PASSWORD.TITLE}
      description={AUTH_TEXT.FORGOT_PASSWORD.DESCRIPTION}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
