import { TeacherMonitorClient } from "./monitor-client";

export default async function TeacherMonitorPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <TeacherMonitorClient sessionId={sessionId} />;
}
