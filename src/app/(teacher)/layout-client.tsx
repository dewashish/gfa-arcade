"use client";

import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { TeacherHeader } from "@/components/layout/TeacherHeader";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { PageTransition } from "@/components/shared/PageTransition";

interface Props {
  teacherName: string;
  teacherEmail: string;
  teacherRole: string;
  children: React.ReactNode;
}

export function TeacherLayoutClient({
  teacherName,
  teacherEmail,
  teacherRole,
  children,
}: Props) {
  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar
        teacherName={teacherName}
        teacherEmail={teacherEmail}
        teacherRole={teacherRole}
      />
      <main
        id="main"
        className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-surface relative pb-20 md:pb-0"
      >
        <TeacherHeader
          teacherName={teacherName}
          teacherEmail={teacherEmail}
          teacherRole={teacherRole}
        />
        <div className="flex-1 p-4 md:p-12 max-w-7xl mx-auto w-full">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
