import AuthCard from "../components/AuthCard";
import LoginForm from "../components/LoginForm";

export default function LoginView() {
  return (
    <AuthCard
      title="Welcome Back"
      description="Sign in to continue to your dashboard."
    >
      <LoginForm />
    </AuthCard>
  );
}