export const AUTH_TEXT = {
  FORGOT_PASSWORD: {
    TITLE: "Forgot Password?",
    DESCRIPTION:
      "Enter your email address and we’ll send you a link to reset your password.",

    EMAIL_LABEL: "Email",
    EMAIL_PLACEHOLDER: "Enter your email",

    SUBMIT: "Send Reset Link",
    LOADING: "Sending Reset Link...",

    BACK_TO_LOGIN: "Back to login",
  },

  LOGIN: {
    TITLE: "Welcome Back",
    DESCRIPTION: "Sign in to continue to your dashboard.",

    EMAIL_LABEL: "Email",
    EMAIL_PLACEHOLDER: "Enter your email",

    PASSWORD_LABEL: "Password",
    PASSWORD_PLACEHOLDER: "Enter your password",

    SUBMIT: "Sign In",
    LOADING: "Signing In...",

    REMEMBER_ME: "Remember me",

    FORGOT_PASSWORD: "Forgot password?",
  },

  RESET_PASSWORD: {
    TITLE: "Reset Your Password",
    DESCRIPTION: "Create a new password for your account.",

    PASSWORD_LABEL: "New Password",
    PASSWORD_PLACEHOLDER: "Enter your new password",

    CONFIRM_PASSWORD_LABEL: "Confirm Password",
    CONFIRM_PASSWORD_PLACEHOLDER: "Confirm your new password",

    SUBMIT: "Reset Password",
    LOADING: "Resetting Password...",

    BACK_TO_LOGIN: "Back to login",
  },
} as const;