import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
