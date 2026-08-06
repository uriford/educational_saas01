import { auth } from "@/auth";

export default auth((req) => {
  // You can add authorization logic here later.
});

export const config = {
  matcher: ["/dashboard/:path*"],
};