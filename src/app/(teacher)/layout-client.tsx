"use client";

import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { TeacherHeader } from "@/components/layout/TeacherHeader";

interface Props {
  teacherName: string;
  teacherEmail: string;
  children: React.ReactNode;
}

export function TeacherLayoutClient({ teacherName, teacherEmail, children }: Props) {
  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar teacherName={teacherName} teacherEmail={teacherEmail} />
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-surface relative">
        <TeacherHeader teacherName={teacherName} />
        <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
