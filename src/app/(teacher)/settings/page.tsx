import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Use any cast because supabase auto-types don't yet know about
  // the classroom + role columns added by supabase-teacher-profile.sql
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: teacherRaw } = await (supabase
    .from("teachers")
    .select("*")
    .eq("id", user.id)
    .single() as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const teacher = teacherRaw as any;

  return (
    <SettingsClient
      email={user.email ?? ""}
      initialName={teacher?.name ?? ""}
      initialSchool={teacher?.school_name ?? "GEMS Founders School"}
      initialClassroom={teacher?.classroom ?? ""}
      initialRole={teacher?.role ?? ""}
    />
  );
}
