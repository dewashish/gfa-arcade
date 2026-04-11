import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatTeacherRole } from "@/lib/teacher-role";
import { TeacherLayoutClient } from "./layout-client";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get teacher profile
  const { data: teacher } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <TeacherLayoutClient
      teacherName={teacher?.name ?? user.email?.split("@")[0] ?? "Teacher"}
      teacherEmail={user.email ?? ""}
      teacherRole={formatTeacherRole(teacher?.role)}
    >
      {children}
    </TeacherLayoutClient>
  );
}
