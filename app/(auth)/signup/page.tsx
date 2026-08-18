import AuthCard from "@/features/auth/components/AuthCard";
import SignupForm from "@/features/auth/components/SignupForm";

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your student account"
      description="Register as a student to access your courses and learning portal."
    >
      <SignupForm />
    </AuthCard>
  );
}
