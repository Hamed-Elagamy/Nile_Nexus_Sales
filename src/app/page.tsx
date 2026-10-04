import { redirect } from "next/navigation";

/**
 * Root page — redirects to dashboard.
 * Auth middleware will redirect to /login if not authenticated.
 */
export default function HomePage() {
  redirect("/dashboard");
}
