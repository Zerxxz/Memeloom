import { redirect } from "next/navigation";

export default function ProfilePage() {
  // Profile is per-wallet; for hackathon demo, route back to feed.
  // (Future: per-address profiles, creator dashboards, follow graph.)
  redirect("/feed");
}
