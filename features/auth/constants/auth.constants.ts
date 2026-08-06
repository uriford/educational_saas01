export const AUTH_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,

  SESSION_MAX_AGE: 60 * 60 * 24 * 7, // 7 Days

  LOGIN_REDIRECT: "/dashboard",

  LOGIN_ROUTE: "/login",

  LOGOUT_REDIRECT: "/login",
} as const;