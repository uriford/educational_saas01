import NextAuth from "next-auth";

import authConfig from "./auth.config";

const proxyConfig = {
  ...authConfig,
  providers: [],
};

const { auth } = NextAuth(proxyConfig);

export default auth(() => {
  // Proxy-level authentication checks can be added here later.
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
